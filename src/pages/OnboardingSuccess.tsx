import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { CheckCircle, ExternalLink, Mail, Settings, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const OnboardingSuccess: React.FC = () => {
  const location = useLocation();
  const { hoaId } = location.state || {
    hoaId: 'demo'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Welcome to HOA Connect!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your HOA violation reporting system is now live and ready to use.
          </p>
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Button className="h-auto p-4 flex flex-col items-start space-y-2" asChild>
                  <Link to={`/${hoaId}/admin/dashboard`}>
                    <div className="flex items-center w-full">
                      <Settings className="w-5 h-5 mr-2" />
                      <span className="font-medium">Admin Dashboard</span>
                    </div>
                    <span className="text-sm opacity-90">
                      Manage violations and settings
                    </span>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start space-y-2" asChild>
                  <Link to={`/${hoaId}`}>
                    <div className="flex items-center w-full">
                      <ExternalLink className="w-5 h-5 mr-2" />
                      <span className="font-medium">View Public Page</span>
                    </div>
                    <span className="text-sm opacity-75">
                      See what residents will see
                    </span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Share Your Violation Reporting URL</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Give residents this link to report violations:
                    </p>
                    <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                      hoaconnect.com/{hoaId}/submit
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Customize Email Templates</h3>
                    <p className="text-gray-600 text-sm">
                      Personalize the notification emails sent to property owners
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Add Additional Administrators</h3>
                    <p className="text-gray-600 text-sm">
                      Invite other board members to help manage violations
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Information */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-gray-600 text-sm">support@hoaconnect.com</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Community Forum</p>
                    <p className="text-gray-600 text-sm">Connect with other HOA administrators</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Getting Started Tips */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-900">💡 Pro Tips for Success</h2>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Post the violation reporting link in your community newsletter and website</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Set up email notifications to stay on top of new reports</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Use the photo feature to document violations clearly</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Update violation statuses to keep residents informed</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="text-center mt-8">
          <Button size="lg" asChild>
            <Link to={`/${hoaId}/admin/dashboard`}>
              Get Started with Your Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSuccess;