import React, { useState } from 'react';
import { Search, User, Mail, Phone, MapPin, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../components/Button';
import { cn } from '../utils/cn';
import api from '../utils/api';
import type { CreateCustomerRequest, CreateCustomerResponse, FindCustomerRequest, Customer } from '../types/customer';

const CustomerManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'search'>('create');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create Customer Form
  const [createForm, setCreateForm] = useState<CreateCustomerRequest>({
    document: '',
    firstname: '',
    lastname: '',
    address: '',
    phone: '',
    email: ''
  });

  // Search Customer Form
  const [searchForm, setSearchForm] = useState<FindCustomerRequest>({
    customerid: ''
  });
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);

  const handleCreateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({ ...prev, [name]: value }));
    if (message) setMessage(null);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({ ...prev, [name]: value }));
    if (message) setMessage(null);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await api.post<CreateCustomerResponse>('/customer/createcustomer', createForm);
      
      if (response.data.createCustomerValid) {
        setMessage({ type: 'success', text: 'Customer created successfully!' });
        setCreateForm({
          document: '',
          firstname: '',
          lastname: '',
          address: '',
          phone: '',
          email: ''
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to create customer' });
      }
    } catch (err: any) {
      console.error('Create customer error:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'An error occurred while creating customer'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setFoundCustomer(null);

    try {
      const response = await api.get<Customer>(`/customer/findcustomerbyid?customerid=${searchForm.customerid}`);
      setFoundCustomer(response.data);
      setMessage({ type: 'success', text: 'Customer found successfully!' });
    } catch (err: any) {
      console.error('Search customer error:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Customer not found'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Management</h1>
          <p className="text-gray-600">Create and search customers in the system</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-micro-lg border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('create')}
              className={cn(
                'flex-1 px-6 py-4 text-sm font-medium transition-colors',
                activeTab === 'create'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <User className="w-4 h-4 inline-block mr-2" />
              Create Customer
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={cn(
                'flex-1 px-6 py-4 text-sm font-medium transition-colors',
                activeTab === 'search'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Search className="w-4 h-4 inline-block mr-2" />
              Search Customer
            </button>
          </div>

          <div className="p-8">
            {/* Message Display */}
            {message && (
              <div className={cn(
                'mb-6 p-4 rounded-lg border animate-fade-in',
                message.type === 'success' 
                  ? 'bg-success-50 border-success-200 text-success-700'
                  : 'bg-error-50 border-error-200 text-error-700'
              )}>
                <div className="flex items-center">
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  ) : (
                    <AlertCircle className="w-5 h-5 mr-2" />
                  )}
                  <span>{message.text}</span>
                </div>
              </div>
            )}

            {/* Create Customer Tab */}
            {activeTab === 'create' && (
              <form onSubmit={handleCreateCustomer} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Document */}
                  <div>
                    <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-2">
                      Document ID *
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="document"
                        name="document"
                        type="text"
                        required
                        value={createForm.document}
                        onChange={handleCreateInputChange}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter document ID"
                      />
                    </div>
                  </div>

                  {/* First Name */}
                  <div>
                    <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      id="firstname"
                      name="firstname"
                      type="text"
                      required
                      value={createForm.firstname}
                      onChange={handleCreateInputChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter first name"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      id="lastname"
                      name="lastname"
                      type="text"
                      required
                      value={createForm.lastname}
                      onChange={handleCreateInputChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter last name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={createForm.email}
                        onChange={handleCreateInputChange}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={createForm.phone}
                        onChange={handleCreateInputChange}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input
                        id="address"
                        name="address"
                        type="text"
                        required
                        value={createForm.address}
                        onChange={handleCreateInputChange}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter full address"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="min-w-32"
                  >
                    Create Customer
                  </Button>
                </div>
              </form>
            )}

            {/* Search Customer Tab */}
            {activeTab === 'search' && (
              <div className="space-y-6">
                <form onSubmit={handleSearchCustomer} className="flex gap-4">
                  <div className="flex-1">
                    <label htmlFor="customerid" className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Document ID
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="customerid"
                        name="customerid"
                        type="text"
                        required
                        value={searchForm.customerid}
                        onChange={handleSearchInputChange}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter document ID to search"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={isLoading}
                      className="min-w-32"
                    >
                      Search
                    </Button>
                  </div>
                </form>

                {/* Customer Details */}
                {foundCustomer && (
                  <div className="bg-gray-50 rounded-xl p-6 animate-fade-in">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Document ID:</span>
                        <p className="text-gray-900">{foundCustomer.document}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Full Name:</span>
                        <p className="text-gray-900">{foundCustomer.firstname} {foundCustomer.lastname}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Email:</span>
                        <p className="text-gray-900">{foundCustomer.email}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Phone:</span>
                        <p className="text-gray-900">{foundCustomer.phone}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-sm font-medium text-gray-500">Address:</span>
                        <p className="text-gray-900">{foundCustomer.address}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerManagementPage;