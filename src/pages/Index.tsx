import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck,
  Shield,
  BookOpen,
  Clock,
  Calendar,
  Bell,
  User,
  CheckCircle,
  Award,
  TrendingUp,
  Smartphone,
  Users
} from 'lucide-react';
import Layout from "@/components/layout/Layout";
import { cn } from "@/lib/utils";

// =============================================
// COMPONENT: STATS COUNTER
// =============================================
interface CounterProps {
  end: number;
  label: string;
  duration?: number;
  delay?: number;
}

const Counter: React.FC<CounterProps> = ({ end, label, duration = 2, delay = 0 }) => {
  const [count, setCount] = useState(0);
  const increment = Math.ceil(end / (duration * 60));

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (count < end) {
      timeout = setTimeout(() => {
        setCount(prev => Math.min(prev + increment, end));
      }, 1000 / 60);
    }

    return () => clearTimeout(timeout);
  }, [count, end, increment]);

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <span className="block text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
        {count}+
      </span>
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {label}
      </span>
    </motion.div>
  );
};

// =============================================
// COMPONENT: TESTIMONIAL CARD
// =============================================
interface TestimonialCardProps {
  content: string;
  author: string;
  role: string;
  index: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ content, author, role, index }) => (
  <motion.div
    className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 * index }}
  >
    <div className="flex flex-col h-full">
      <div className="mb-4 text-blue-600 dark:text-blue-400">
        <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.039 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" />
        </svg>
      </div>
      <p className="text-gray-700 dark:text-gray-300 flex-grow mb-4">{content}</p>
      <div>
        <p className="font-bold text-gray-900 dark:text-white">{author}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{role}</p>
      </div>
    </div>
  </motion.div>
);

// =============================================
// COMPONENT: FEATURE CARD
// =============================================
interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  delay = 0
}) => (
  <motion.div
    className="group relative flex flex-col items-center text-center p-6 
      bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl 
      transition-all duration-300 transform hover:-translate-y-2 hover:bg-blue-50 dark:hover:bg-gray-700
      border border-gray-100 dark:border-gray-700 h-full"
    whileHover={{ scale: 1.03 }}
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    {/* Animated Icon with Gradient Background */}
    <motion.div
      className="mb-4 p-4 rounded-full bg-gradient-to-br 
        from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900"
      whileHover={{ rotate: 15 }}
    >
      <Icon className="h-8 w-8 text-blue-600 dark:text-blue-300" />
    </motion.div>

    {/* Feature Title */}
    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
      {title}
    </h3>

    {/* Feature Description */}
    <p className="text-sm text-gray-600 dark:text-gray-400">
      {description}
    </p>
  </motion.div>
);

// =============================================
// COMPONENT: STEP ITEM
// =============================================
interface StepItemProps {
  number: number;
  title: string;
  description: string;
}

const StepItem: React.FC<StepItemProps> = ({ number, title, description }) => (
  <motion.div
    className="flex items-start space-x-4"
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: number * 0.2 }}
  >
    <div className="flex-shrink-0">
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
        {number}
      </div>
    </div>
    <div>
      <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </motion.div>
);

// =============================================
// MAIN COMPONENT: INDEX PAGE
// =============================================
const Index: React.FC = () => {
  // State for active testimonial section
  const [activeTab, setActiveTab] = useState("students");
  const navigate = useNavigate();
  const [featuresOpen, setFeaturesOpen] = useState(false);

  // Handlers for CTA buttons
  const handleRequestDemo = () => {
    // Navigate to dedicated contact/demo request page
    navigate('/contact');
  };

  const handleViewFeatures = () => {
    // Open features modal instead of scrolling or navigating
    setFeaturesOpen(true);
  };

  // Animation variants for smooth transitions
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  // Demo testimonials data
  const testimonials = {
    students: [
      {
        content: "This system has saved me so much time! I can apply for leave and track my requests anywhere, anytime.",
        author: "Janam",
        role: "MCA Student"
      },
      {
        content: "The notifications feature is amazing! I get instant updates when my leave is approved.",
        author: "Dhvani Patel",
        role: "BCA Student"
      }
    ],
    administrators: [
      {
        content: "Managing student leaves has never been easier. The dashboard gives me all the information I need at a glance.",
        author: "Hardik Kasliwal",
        role: "Department Head"
      },
      {
        content: "The reporting feature allows me to track attendance patterns and make informed decisions.",
        author: "Arvind Padyachi",
        role: "Student Coordinator"
      }
    ]
  };

  return (
    <Layout>
      {/* Hero Section with Full Screen Height */}
      <section className="min-h-screen flex flex-col justify-center items-center 
        bg-gradient-to-br from-blue-50 via-white to-blue-100 
        dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 
        px-4 pt-16 pb-12 overflow-hidden relative">

        {/* Background Decoration Elements */}
        <motion.div
          className="absolute top-20 right-10 w-64 h-64 rounded-full bg-blue-100 dark:bg-blue-900/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            repeat: Infinity,
            duration: 15,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-40 left-10 w-80 h-80 rounded-full bg-indigo-100 dark:bg-indigo-900/20 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            repeat: Infinity,
            duration: 20,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Main Content Container */}
        <motion.div
          className="max-w-7xl w-full mx-auto relative z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Hero Content */}
          <div className="text-center mb-16">
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold 
                text-gray-900 dark:text-white mb-6 leading-tight tracking-tight
                bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600
                dark:from-blue-400 dark:to-indigo-400"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Leave Management System
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 
                max-w-3xl mx-auto mb-10"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Simplify leave applications, track requests, and manage approvals with our
              comprehensive digital solution designed for modern educational institutions.
            </motion.p>

            {/* Stats Counter Row */}
            <motion.div
              className="flex justify-center space-x-8 md:space-x-16 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Counter end={500} label="Institutions" delay={0.2} />
              <Counter end={150000} label="Students" delay={0.4} />
              <Counter end={98} label="Approval Rate %" delay={0.6} />
            </motion.div>
          </div>

          {/* Features Section with 3x2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
            <FeatureCard
              icon={ClipboardCheck}
              title="Smart Applications"
              description="Submit leave requests with just a few clicks, with intelligent form validation and templates."
              delay={0.2}
            />
            <FeatureCard
              icon={Bell}
              title="Instant Notifications"
              description="Get real-time alerts about application status changes via email and mobile push notifications."
              delay={0.3}
            />
            <FeatureCard
              icon={Shield}
              title="Enterprise Security"
              description="Bank-grade encryption and security protocols to protect all student and institutional data."
              delay={0.4}
            />
            <FeatureCard
              icon={Users}
              title="Role-Based Access"
              description="Customized interfaces for students, faculty, and administrators with appropriate permissions."
              delay={0.5}
            />
            <FeatureCard
              icon={Calendar}
              title="Calendar Integration"
              description="Sync with Google Calendar, Outlook, and other calendar services for better planning."
              delay={0.6}
            />
            <FeatureCard
              icon={TrendingUp}
              title="Analytics Dashboard"
              description="Comprehensive reports and analytics to track trends and optimize institutional policies."
              delay={0.7}
            />
          </div>

          {/* How It Works Section */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              How Student Leave Management Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StepItem
                number={1}
                title="Submit Application"
                description="Students fill a simple digital form with leave details and supporting documents if needed."
              />
              <StepItem
                number={2}
                title="Automated Processing"
                description="The system routes applications to appropriate administrators based on leave type and duration."
              />
              <StepItem
                number={3}
                title="Real-time Updates"
                description="Both students and administrators receive notifications about application status changes."
              />
            </div>
          </motion.div>

          {/* Testimonials Section with Tabs */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              What Our Users Say
            </h2>

            <div className="flex justify-center mb-8">
              <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <button
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                    activeTab === "students"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  )}
                  onClick={() => setActiveTab("students")}
                >
                  Students
                </button>
                <button
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                    activeTab === "administrators"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  )}
                  onClick={() => setActiveTab("administrators")}
                >
                  Administrators
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {testimonials[activeTab as keyof typeof testimonials].map((testimonial, index) => (
                  <TestimonialCard
                    key={index}
                    content={testimonial.content}
                    author={testimonial.author}
                    role={testimonial.role}
                    index={index}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-8 text-white text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to modernize student leave management?
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join hundreds of educational institutions already benefiting from our platform.
              Implementation takes less than a week with no disruption to existing processes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={handleRequestDemo} className="px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
                Request Demo
              </button>
              <button onClick={handleViewFeatures} className="px-8 py-3 bg-blue-800 bg-opacity-50 text-white font-semibold rounded-lg hover:bg-opacity-70 transition-colors">
                View Features
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Modal */}
      <Dialog open={featuresOpen} onOpenChange={setFeaturesOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Platform Features</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={ClipboardCheck}
              title="Smart Applications"
              description="Submit leave requests with intelligent validation and templates." />
            <FeatureCard
              icon={Bell}
              title="Instant Notifications"
              description="Real-time alerts via email and mobile push notifications." />
            <FeatureCard
              icon={Shield}
              title="Enterprise Security"
              description="Bank-grade encryption and security protocols to protect data." />
            <FeatureCard
              icon={Users}
              title="Role-Based Access"
              description="Customized interfaces for students, faculty, and administrators." />
            <FeatureCard
              icon={Calendar}
              title="Calendar Integration"
              description="Sync with Google Calendar, Outlook, and more." />
            <FeatureCard
              icon={TrendingUp}
              title="Analytics Dashboard"
              description="Comprehensive reports and analytics to track trends." />
          </div>
        </DialogContent>
      </Dialog>

      {/* Additional Benefits Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Benefits for Every Stakeholder
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <User className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">For Students</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Easy application process</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Track application status</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Automatic notifications</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-4" />
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">For Faculty</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Simplified approval workflow</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Class attendance insights</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Reduced paperwork</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Award className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-4" />
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">For Administrators</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Centralized record keeping</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Comprehensive analytics</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Custom reporting tools</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Smartphone className="h-8 w-8 text-teal-600 dark:text-teal-400 mb-4" />
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">For Parents</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Optional leave notifications</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Attendance transparency</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Real-time leave status</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;