package services

import (
	"fmt"
	"time"

	"github.com/hashicorp/consul/api"
	"login-service/pkg/logger"
)

// ConsulService handles service registration with Consul
type ConsulService struct {
	client *api.Client
	logger *logger.Logger
}

// NewConsulService creates a new Consul service
func NewConsulService(consulHost string, consulPort int, logger *logger.Logger) (*ConsulService, error) {
	config := api.DefaultConfig()
	config.Address = fmt.Sprintf("%s:%d", consulHost, consulPort)

	client, err := api.NewClient(config)
	if err != nil {
		return nil, fmt.Errorf("failed to create Consul client: %w", err)
	}

	return &ConsulService{
		client: client,
		logger: logger,
	}, nil
}

// RegisterService registers the service with Consul
func (c *ConsulService) RegisterService(serviceName, serviceID, serviceHost string, servicePort int, healthCheckPath string) error {
	registration := &api.AgentServiceRegistration{
		ID:      serviceID,
		Name:    serviceName,
		Address: serviceHost,
		Port:    servicePort,
		Tags:    []string{"microservice", "login", "api"},
		Check: &api.AgentServiceCheck{
			HTTP:                           fmt.Sprintf("http://%s:%d%s", serviceHost, servicePort, healthCheckPath),
			Interval:                       "10s",
			Timeout:                        "5s",
			DeregisterCriticalServiceAfter: "30s",
		},
	}

	err := c.client.Agent().ServiceRegister(registration)
	if err != nil {
		return fmt.Errorf("failed to register service with Consul: %w", err)
	}

	c.logger.Info(fmt.Sprintf("Service %s registered with Consul successfully", serviceName))
	return nil
}

// DeregisterService removes the service from Consul
func (c *ConsulService) DeregisterService(serviceID string) error {
	err := c.client.Agent().ServiceDeregister(serviceID)
	if err != nil {
		return fmt.Errorf("failed to deregister service from Consul: %w", err)
	}

	c.logger.Info(fmt.Sprintf("Service %s deregistered from Consul successfully", serviceID))
	return nil
}

// GetServiceHealth checks the health of a service
func (c *ConsulService) GetServiceHealth(serviceName string) ([]*api.ServiceEntry, error) {
	services, _, err := c.client.Health().Service(serviceName, "", false, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to get service health: %w", err)
	}

	return services, nil
}

// WaitForConsul waits for Consul to be available
func (c *ConsulService) WaitForConsul(maxRetries int, retryInterval time.Duration) error {
	for i := 0; i < maxRetries; i++ {
		_, err := c.client.Status().Leader()
		if err == nil {
			c.logger.Info("Consul is available")
			return nil
		}

		c.logger.Warn(fmt.Sprintf("Consul not available, retry %d/%d", i+1, maxRetries))
		time.Sleep(retryInterval)
	}

	return fmt.Errorf("Consul not available after %d retries", maxRetries)
}
