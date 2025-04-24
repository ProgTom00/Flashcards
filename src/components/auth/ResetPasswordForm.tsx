import { useState } from "react";

interface ResetPasswordFormProps {
  onSubmit: (email: string) => void;
}

export default function ResetPasswordForm({ onSubmit }: ResetPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email format");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(email);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
        <p className="mt-2 text-sm text-gray-600">
          If an account exists for {email}, you will receive a password reset link shortly.
        </p>
        <a href="/auth/login" className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-500">
          Return to sign in
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Reset your password</h3>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email address and we will send you a link to reset your password.
        </p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Send reset link
      </button>

      <div className="text-center text-sm">
        <a href="/auth/login" className="text-blue-600 hover:text-blue-500">
          Back to sign in
        </a>
      </div>
    </form>
  );
}
