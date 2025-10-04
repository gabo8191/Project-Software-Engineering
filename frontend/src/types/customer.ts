export interface Customer {
  document: string;
  firstname: string;
  lastname: string;
  address: string;
  phone: string;
  email: string;
}

export interface CreateCustomerRequest {
  document: string;
  firstname: string;
  lastname: string;
  address: string;
  phone: string;
  email: string;
}

export interface CreateCustomerResponse {
  createCustomerValid: boolean;
}

export interface FindCustomerRequest {
  customerid: string;
}

export interface FindCustomerResponse extends Customer {}