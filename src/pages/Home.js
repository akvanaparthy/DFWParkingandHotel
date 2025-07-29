import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Plane,
  Car,
  Building,
  Shield,
  Clock,
  MapPin,
  Star,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Zap,
} from "lucide-react";

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Plane className="h-8 w-8 text-primary-600" />,
      title: "Airport Proximity",
      description:
        "Hotels and parking lots strategically located near DFW Airport for your convenience.",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      title: "Secure Parking",
      description:
        "24/7 security monitoring and covered parking options for your vehicle's safety.",
      gradient: "from-green-500 to-green-600",
    },
    {
      icon: <Clock className="h-8 w-8 text-primary-600" />,
      title: "24/7 Service",
      description:
        "Round-the-clock booking and support services for your travel needs.",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      icon: <MapPin className="h-8 w-8 text-primary-600" />,
      title: "Easy Access",
      description:
        "Convenient shuttle services and quick access to DFW Airport terminals.",
      gradient: "from-orange-500 to-orange-600",
    },
  ];

  const bookingOptions = [
    {
      title: "Hotel Booking",
      description: "Book comfortable hotel rooms near DFW Airport",
      icon: <Building className="h-12 w-12 text-primary-600" />,
      href: "/booking/hotel",
      color: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Parking Booking",
      description: "Secure parking spots for your vehicle",
      icon: <Car className="h-12 w-12 text-accent-600" />,
      href: "/booking/parking",
      color: "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200",
      gradient: "from-yellow-500 to-yellow-600",
    },
    {
      title: "Hotel + Parking",
      description: "Book both hotel and parking together",
      icon: <Plane className="h-12 w-12 text-green-600" />,
      href: "/booking/both",
      color: "bg-gradient-to-br from-green-50 to-green-100 border-green-200",
      gradient: "from-green-500 to-green-600",
    },
  ];

  const stats = [
    {
      number: "500+",
      label: "Parking Spots",
      icon: <Car className="h-6 w-6" />,
    },
    {
      number: "50+",
      label: "Hotel Rooms",
      icon: <Building className="h-6 w-6" />,
    },
    {
      number: "10,000+",
      label: "Happy Customers",
      icon: <Star className="h-6 w-6" />,
    },
    {
      number: "24/7",
      label: "Support Available",
      icon: <Clock className="h-6 w-6" />,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-accent-500/20"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 floating">
          <div className="w-4 h-4 bg-white/20 rounded-full"></div>
        </div>
        <div
          className="absolute top-40 right-20 floating"
          style={{ animationDelay: "1s" }}
        >
          <div className="w-6 h-6 bg-accent-400/30 rounded-full"></div>
        </div>
        <div
          className="absolute bottom-20 left-1/4 floating"
          style={{ animationDelay: "2s" }}
        >
          <div className="w-3 h-3 bg-white/30 rounded-full"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center slide-in">
            <div className="flex justify-center items-center space-x-2 mb-6">
              <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                <Plane className="h-12 w-12" />
              </div>
              <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                <Car className="h-10 w-10" />
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              DFW Airport
              <span className="block text-accent-400 gradient-text">
                Parking & Hotels
              </span>
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto leading-relaxed">
              Your trusted partner for convenient parking and comfortable hotel
              stays near DFW Airport. Book with confidence and travel with ease.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="btn-accent text-lg px-8 py-4 inline-flex items-center justify-center group"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="glass-effect text-lg px-8 py-4 font-semibold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all duration-200 inline-flex items-center justify-center"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  to="/booking/hotel"
                  className="btn-accent text-lg px-8 py-4 inline-flex items-center justify-center group"
                >
                  Start Booking
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="gradient-text">DFW Parking?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide the most convenient and reliable parking and hotel
              booking services near DFW Airport.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center group scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl group-hover:shadow-glow transition-all duration-300">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Options Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your <span className="gradient-text">Booking Option</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select the service that best fits your travel needs. Book
              individually or combine both for maximum convenience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {bookingOptions.map((option, index) => (
              <Link
                key={index}
                to={option.href}
                className={`group block p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${option.color} scale-in`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-white rounded-2xl shadow-md group-hover:shadow-lg transition-all duration-300">
                      {option.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {option.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {option.description}
                  </p>
                  <div className="flex items-center justify-center text-primary-600 font-semibold group-hover:text-primary-700 transition-colors">
                    Book Now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-4xl font-bold mb-2 pulse-gentle">
                  {stat.number}
                </div>
                <div className="text-primary-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="fade-in">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Book Your{" "}
              <span className="gradient-text">DFW Experience?</span>
            </h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Join thousands of satisfied customers who trust us for their DFW
              Airport parking and hotel needs.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/booking/hotel"
                className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center group"
              >
                <Building className="mr-2 h-5 w-5" />
                Book Hotel
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/booking/parking"
                className="btn-secondary text-lg px-8 py-4 inline-flex items-center justify-center group"
              >
                <Car className="mr-2 h-5 w-5" />
                Book Parking
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
