import React from 'react';
import Layout from '@/components/layout/Layout';
import { ClipboardCheck, Bell, Shield, Users, Calendar, TrendingUp } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string; }) => (
  <div className="group relative flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full">
    <div className="mb-4 p-4 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900">
      <Icon className="h-8 w-8 text-blue-600 dark:text-blue-300" />
    </div>
    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

const Features: React.FC = () => {
  return (
    <Layout>
      <section className="px-4 pt-24 pb-16 bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white text-center mb-10">Platform Features</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <FeatureCard icon={ClipboardCheck} title="Smart Applications" description="Submit leave requests with intelligent validation and templates." />
            <FeatureCard icon={Bell} title="Instant Notifications" description="Real-time alerts via email and mobile push notifications." />
            <FeatureCard icon={Shield} title="Enterprise Security" description="Bank-grade encryption and security protocols to protect data." />
            <FeatureCard icon={Users} title="Role-Based Access" description="Customized interfaces for students, faculty, and administrators." />
            <FeatureCard icon={Calendar} title="Calendar Integration" description="Sync with Google Calendar, Outlook, and more." />
            <FeatureCard icon={TrendingUp} title="Analytics Dashboard" description="Comprehensive reports and analytics to track trends." />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Features;
