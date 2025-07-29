import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Plane,
  Car,
  Building,
  Shield,
} from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const demoCredentials = [
    {
      role: "Super Admin",
      email: "admin@dfwparking.com",
      password: "password123",
    },
    {
      role: "Hotel Admin",
      email: "hotel@dfwparking.com",
      password: "password123",
    },
    {
      role: "Parking Admin",
      email: "parking@dfwparking.com",
      password: "password123",
    },
    {
      role: "Customer (John)",
      email: "john@example.com",
      password: "password123",
    },
    {
      role: "Customer (Jane)",
      email: "jane@example.com",
      password: "password123",
    },
    {
      role: "Support",
      email: "support@dfwparking.com",
      password: "password123",
    },
  ];

  const features = [
    {
      icon: <Plane className="h-6 w-6" />,
      title: "Airport Proximity",
      description: "Hotels and parking near DFW Airport",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Service",
      description: "24/7 security and monitoring",
    },
    {
      icon: <Building className="h-6 w-6" />,
      title: "Quality Hotels",
      description: "Comfortable accommodations",
    },
    {
      icon: <Car className="h-6 w-6" />,
      title: "Reliable Parking",
      description: "Safe and convenient parking",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Login Form */}
          <div className="fade-in">
            <div className="card max-w-md mx-auto lg:mx-0">
              <div className="text-center mb-8">
                <div className="flex justify-center items-center space-x-2 mb-6">
                  <div className="flex items-center space-x-1 p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl">
                    <Plane className="h-8 w-8 text-primary-600" />
                    <Car className="h-6 w-6 text-accent-500" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-600">
                  Sign in to your DFW Parking account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="form-label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="input-field pl-10 pr-10"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center group"
                >
                  {loading ? (
                    <span className="loading-dots">Signing in</span>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>

            {/* Demo Credentials */}
            <div className="mt-8 card max-w-md mx-auto lg:mx-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Demo Credentials
              </h3>
              <div className="space-y-3">
                {demoCredentials.map((cred, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      setFormData({
                        email: cred.email,
                        password: cred.password,
                      })
                    }
                    className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 group-hover:text-primary-700">
                          {cred.role}
                        </div>
                        <div className="text-sm text-gray-500">
                          {cred.email}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Features */}
          <div className="hidden lg:block">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                DFW Airport
                <span className="block gradient-text">Parking & Hotels</span>
              </h1>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                Your trusted partner for convenient parking and comfortable
                hotel stays near DFW Airport. Book with confidence and travel
                with ease.
              </p>

              <div className="grid grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="text-center scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Why Choose DFW Parking?
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                    Secure 24/7 parking facilities
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                    Convenient airport shuttle service
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                    Quality hotel accommodations
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                    Competitive pricing and deals
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
