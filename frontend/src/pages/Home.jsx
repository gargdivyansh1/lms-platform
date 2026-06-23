// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AcademicCapIcon,
  BookOpenIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon,
  TrophyIcon,
  UsersIcon,
  GlobeAltIcon,
  ClockIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

// Import images
import firstImage from '../assets/first.png';
import secondImage from '../assets/second.png';
import thirdImage from '../assets/third.png';

const Home = () => {
  const { isAuthenticated, isInstructor, isAdmin, user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: firstImage,
      title: 'Learn from the Best',
      description: 'Access expert-led courses taught by industry professionals.',
      alt: 'Expert instructors teaching'
    },
    {
      image: secondImage,
      title: 'Interactive Learning',
      description: 'Engage with hands-on projects and real-world applications.',
      alt: 'Interactive learning experience'
    },
    {
      image: thirdImage,
      title: 'Achieve Your Goals',
      description: 'Earn certificates and advance your career with confidence.',
      alt: 'Students achieving goals'
    }
  ];

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const features = [
    {
      icon: AcademicCapIcon,
      title: 'Expert Instructors',
      description: 'Learn from industry professionals with years of real-world experience.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: BookOpenIcon,
      title: 'Comprehensive Courses',
      description: 'Access hundreds of courses across various disciplines and skill levels.',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: UserGroupIcon,
      title: 'Community Learning',
      description: 'Connect with fellow learners, share insights, and grow together.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Career Growth',
      description: 'Gain in-demand skills that accelerate your career progression.',
      color: 'from-amber-500 to-amber-600'
    },
    {
      icon: ChartBarIcon,
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed analytics and insights.',
      color: 'from-rose-500 to-rose-600'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Platform',
      description: 'Your data and progress are protected with enterprise-grade security.',
      color: 'from-cyan-500 to-cyan-600'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      content: 'This platform completely transformed my career. The courses are comprehensive and the instructors are truly experts.',
      rating: 5,
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=6366f1&color=fff&size=60'
    },
    {
      name: 'Michael Chen',
      role: 'Data Scientist',
      content: 'The best learning platform I have ever used. The hands-on projects and community support are outstanding.',
      rating: 5,
      avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=06b6d4&color=fff&size=60'
    },
    {
      name: 'Emily Rodriguez',
      role: 'UX Designer',
      content: 'I was able to transition into a new career thanks to the practical skills I learned here. Highly recommended!',
      rating: 5,
      avatar: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=ec4899&color=fff&size=60'
    }
  ];

  // Get the appropriate dashboard link based on user role
  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isInstructor) return '/instructor';
    if (isAuthenticated) return '/student';
    return '/courses';
  };

  const getDashboardLabel = () => {
    if (isAdmin) return 'Go to Admin Dashboard';
    if (isInstructor) return 'Go to Instructor Dashboard';
    if (isAuthenticated) return 'Go to Dashboard';
    return 'Browse Courses';
  };

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 -z-10"></div>
        <div className="absolute inset-0 opacity-30 dark:opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 relative">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 mb-6">
              <SparklesIcon className="h-4 w-4 mr-2" />
              Empowering Learners Worldwide
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Learn, Grow, and{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Succeed
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              Access world-class courses taught by industry experts. Track your progress,
              earn certificates, and advance your career.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-lg font-medium"
                  >
                    {getDashboardLabel()}
                    <ArrowRightIcon className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/courses"
                    className="px-8 py-4 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-lg font-medium"
                  >
                    <BookOpenIcon className="h-5 w-5 inline mr-2" />
                    Browse Courses
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-lg font-medium"
                  >
                    Get Started Free
                    <ArrowRightIcon className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-4 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-lg font-medium"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                Trusted by 10,000+ learners
              </span>
              <span className="w-px h-6 bg-slate-300 dark:bg-slate-600"></span>
              <span className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-blue-500" />
                500+ expert-led courses
              </span>
              <span className="w-px h-6 bg-slate-300 dark:bg-slate-600"></span>
              <span className="flex items-center gap-2">
                <GlobeAltIcon className="h-5 w-5 text-purple-500" />
                Available in 50+ countries
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Image Carousel / Showcase Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Learning Experience
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            See what makes our platform the best choice for your learning journey.
          </p>
        </div>

        <div className="relative">
          {/* Carousel Container */}
          <div className="relative overflow-hidden rounded-2xl shadow-xl">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <div className="relative h-[400px] md:h-[500px] w-full">
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay with text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">
                        {slide.title}
                      </h3>
                      <p className="text-base md:text-lg text-white/90 max-w-2xl">
                        {slide.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all duration-200"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all duration-200"
              aria-label="Next slide"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? 'bg-white w-8'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Why Choose LearnHub?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Everything you need to succeed in your learning journey, all in one place.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-slate-200 dark:border-slate-700 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 text-center border border-slate-200 dark:border-slate-700">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">10K+</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Students</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 text-center border border-slate-200 dark:border-slate-700">
            <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">500+</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Courses</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 text-center border border-slate-200 dark:border-slate-700">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">98%</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Satisfaction Rate</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 text-center border border-slate-200 dark:border-slate-700">
            <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">50+</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Countries</div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            What Our Learners Say
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Real stories from real learners who transformed their careers.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
              <div className="flex text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <StarSolidIcon key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                "{testimonial.content}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="max-w-6xl mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
              Join thousands of students already learning on our platform. Get started today.
            </p>
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-blue-600 rounded-2xl hover:bg-blue-50 transition-all inline-flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
            >
              Create Free Account
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </section>
      )}

      {/* Footer CTA for authenticated users */}
      {isAuthenticated && (
        <section className="max-w-6xl mx-auto px-4">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-900 dark:to-slate-800 rounded-3xl p-10 text-center text-white">
            <div className="flex items-center justify-center gap-3 mb-3">
              <TrophyIcon className="h-8 w-8 text-amber-400" />
              <h2 className="text-2xl font-bold">Continue Your Learning Journey</h2>
            </div>
            <p className="text-slate-300 max-w-2xl mx-auto mb-6">
              {isInstructor 
                ? 'Manage your courses, track student progress, and create new content.'
                : isAdmin
                ? 'Manage the platform, users, and monitor system performance.'
                : 'Access your courses, track your progress, and achieve your goals.'}
            </p>
            <Link
              to={getDashboardLink()}
              className="px-6 py-3 bg-white text-slate-800 rounded-2xl hover:bg-slate-100 transition-all inline-flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
            >
              {isInstructor ? 'Go to Instructor Dashboard' : isAdmin ? 'Go to Admin Dashboard' : 'Go to Dashboard'}
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;