import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupPage from '../page';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('SignupPage', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockFetch.mockReset();
  });

  it('should render the signup form correctly', () => {
    render(<SignupPage />);
    
    // Check if all form fields are present
    expect(screen.getByLabelText(/First name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('should handle successful form submission', async () => {
    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    render(<SignupPage />);
    const user = userEvent.setup();

    // Fill in the form
    await user.type(screen.getByLabelText(/First name/i), 'John');
    await user.type(screen.getByLabelText(/Last name/i), 'Doe');
    await user.type(screen.getByLabelText(/Email/i), 'john.doe@example.com');
    await user.type(screen.getByLabelText(/Phone number/i), '254712345678');
    await user.type(screen.getByLabelText(/^Password$/i), 'Password123!');
    await user.type(screen.getByLabelText(/Confirm password/i), 'Password123!');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /Create Account/i }));

    // Verify API call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '254712345678',
          password: 'Password123!',
        }),
      });
    });

    // Verify success behavior
    expect(toast.success).toHaveBeenCalledWith(
      'Registration successful! You can now sign in to your account.'
    );
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });

  it('should handle form validation errors', async () => {
    render(<SignupPage />);
    const user = userEvent.setup();

    // Touch all fields to trigger "onTouched" validation
    await user.click(screen.getByLabelText(/First name/i));
    await user.tab();
    await user.click(screen.getByLabelText(/Last name/i));
    await user.tab();
    await user.click(screen.getByLabelText(/Email/i));
    await user.tab();
    await user.click(screen.getByLabelText(/Phone number/i));
    await user.tab();
    await user.click(screen.getByLabelText(/^Password$/i));
    await user.tab();
    await user.click(screen.getByLabelText(/Confirm password/i));
    await user.tab();

    // Now try to submit
    await user.click(screen.getByRole('button', { name: /Create Account/i }));

    // Wait for validation errors to appear (only the first error for each field)
    expect(await screen.findByText(/First name must be at least 2 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/Last name must be at least 2 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/Phone number must be in format 254XXXXXXXXX/i)).toBeInTheDocument();
    expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
  });

  it('should handle API error responses', async () => {
    // Mock API error response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        error: 'Email already exists',
        details: {
          fieldErrors: {
            email: ['This email is already registered'],
          },
        },
      }),
    });

    render(<SignupPage />);
    const user = userEvent.setup();

    // Fill in the form
    await user.type(screen.getByLabelText(/First name/i), 'John');
    await user.type(screen.getByLabelText(/Last name/i), 'Doe');
    await user.type(screen.getByLabelText(/Email/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/Phone number/i), '254712345678');
    await user.type(screen.getByLabelText(/^Password$/i), 'Password123!');
    await user.type(screen.getByLabelText(/Confirm password/i), 'Password123!');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /Create Account/i }));

    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText(/This email is already registered/i)).toBeInTheDocument();
    });
  });

  it('should validate password requirements one by one', async () => {
    render(<SignupPage />);
    const user = userEvent.setup();

    // Fill in the form with a short password
    await user.type(screen.getByLabelText(/First name/i), 'John');
    await user.type(screen.getByLabelText(/Last name/i), 'Doe');
    await user.type(screen.getByLabelText(/Email/i), 'john.doe@example.com');
    await user.type(screen.getByLabelText(/Phone number/i), '254712345678');
    await user.type(screen.getByLabelText(/^Password$/i), 'weak');
    await user.type(screen.getByLabelText(/Confirm password/i), 'weak');
    await user.click(screen.getByRole('button', { name: /Create Account/i }));
    expect(await screen.findByText(/Password must be at least 8 characters/i)).toBeInTheDocument();

    // Now enter a password with 8+ chars but no uppercase
    await user.clear(screen.getByLabelText(/^Password$/i));
    await user.type(screen.getByLabelText(/^Password$/i), 'weakpass');
    await user.clear(screen.getByLabelText(/Confirm password/i));
    await user.type(screen.getByLabelText(/Confirm password/i), 'weakpass');
    await user.click(screen.getByRole('button', { name: /Create Account/i }));
    expect(await screen.findByText(/Password must contain at least one uppercase letter/i)).toBeInTheDocument();

    // Now enter a password with uppercase but no number
    await user.clear(screen.getByLabelText(/^Password$/i));
    await user.type(screen.getByLabelText(/^Password$/i), 'Weakpass');
    await user.clear(screen.getByLabelText(/Confirm password/i));
    await user.type(screen.getByLabelText(/Confirm password/i), 'Weakpass');
    await user.click(screen.getByRole('button', { name: /Create Account/i }));
    expect(await screen.findByText(/Password must contain at least one number/i)).toBeInTheDocument();

    // Now enter a password with number but no special character
    await user.clear(screen.getByLabelText(/^Password$/i));
    await user.type(screen.getByLabelText(/^Password$/i), 'Weakpass1');
    await user.clear(screen.getByLabelText(/Confirm password/i));
    await user.type(screen.getByLabelText(/Confirm password/i), 'Weakpass1');
    await user.click(screen.getByRole('button', { name: /Create Account/i }));
    expect(await screen.findByText(/Password must contain at least one special character/i)).toBeInTheDocument();
  });
}); 