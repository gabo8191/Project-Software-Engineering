import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'name',
    direction: 'asc'
  });
  const [processingCustomerId, setProcessingCustomerId] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchCustomers = useCallback(async (page = currentPage, term = searchTerm) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const params = new URLSearchParams({
        skip: ((page - 1) * 10).toString(),
        limit: '10',
      });

      if (term.trim()) {
        params.append('search', term.trim());
      }

      const response = await fetch(`http://localhost:8000/api/customers?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      
      // Since the backend returns an array, we simulate pagination
      const itemsPerPage = 10;
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = data.slice(startIndex, endIndex);
      
      setCustomers(paginatedData);
      setTotalCustomers(data.length);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
      setTotalCustomers(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, navigate]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSort = (field: string) => {
    const newDirection = 
      sortConfig.field === field && sortConfig.direction === 'asc' 
        ? 'desc' 
        : 'asc';
    
    setSortConfig({ field, direction: newDirection });
    
    // Sort customers locally
    const sortedCustomers = [...customers].sort((a, b) => {
      const aValue = a[field as keyof Customer];
      const bValue = b[field as keyof Customer];
      
      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;
      
      if (aValue < bValue) return newDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return newDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setCustomers(sortedCustomers);
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        throw new Error('Failed to create customer');
      }

      // Refresh the list
      fetchCustomers();
      return true;
    } catch (error) {
      console.error('Error creating customer:', error);
      return false;
    }
  };

  const updateCustomer = async (customerId: number, customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        throw new Error('Failed to update customer');
      }

      // Refresh the list
      fetchCustomers();
      return true;
    } catch (error) {
      console.error('Error updating customer:', error);
      return false;
    }
  };

  const deleteCustomer = async (customerId: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este cliente?')) {
      return;
    }

    setProcessingCustomerId(customerId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }

      // Refresh the list
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Error al eliminar el cliente');
    } finally {
      setProcessingCustomerId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchTerm]);

  return {
    customers,
    isLoading,
    searchTerm,
    currentPage,
    totalPages,
    totalCustomers,
    sortConfig,
    processingCustomerId,
    handlePageChange,
    handleSearchChange,
    handleSort,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    formatDate,
    refetch: fetchCustomers,
  };
};