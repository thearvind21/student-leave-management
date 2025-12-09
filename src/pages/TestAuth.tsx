import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TestAuth = () => {
  const [mockEnabled, setMockEnabled] = useState(localStorage.getItem('use_mock_auth') === 'true');
  const navigate = useNavigate();

  const toggleMockAuth = () => {
    const newValue = !mockEnabled;
    setMockEnabled(newValue);
    localStorage.setItem('use_mock_auth', newValue.toString());
    
    if (newValue) {
      alert('Mock authentication enabled! You can now test login with the credentials.');
    } else {
      alert('Mock authentication disabled. Using real Supabase auth.');
    }
  };

  const testLogin = (email: string, password: string, role: string) => {
    // Set credentials for easy testing
    sessionStorage.setItem('test_email', email);
    sessionStorage.setItem('test_password', password);
    sessionStorage.setItem('test_role', role);
    navigate('/login');
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Authentication Testing Panel</CardTitle>
          <CardDescription>
            Use this panel to test authentication with different user types
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mock Auth Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">Mock Authentication</h3>
              <p className="text-sm text-gray-600">
                Enable mock auth to bypass email confirmation issues
              </p>
            </div>
            <Button 
              onClick={toggleMockAuth}
              variant={mockEnabled ? "destructive" : "default"}
            >
              {mockEnabled ? "Disable Mock" : "Enable Mock"}
            </Button>
          </div>

          {/* Test Credentials */}
          <div className="space-y-4">
            <h3 className="font-semibold">Test Credentials</h3>
            
            <div className="grid gap-4">
              {/* Student Test */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Student Login</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> student1@paruluniversity.ac.in</p>
                    <p><strong>Password:</strong> Student@123</p>
                    <p><strong>Expected Redirect:</strong> /my-leaves</p>
                  </div>
                  <Button 
                    className="mt-3" 
                    onClick={() => testLogin('student1@paruluniversity.ac.in', 'Student@123', 'student')}
                  >
                    Test Student Login
                  </Button>
                </CardContent>
              </Card>

              {/* Faculty Test */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Faculty Login</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> faculty1@paruluniversity.ac.in</p>
                    <p><strong>Password:</strong> Faculty@123</p>
                    <p><strong>Expected Redirect:</strong> /faculty/dashboard</p>
                  </div>
                  <Button 
                    className="mt-3" 
                    onClick={() => testLogin('faculty1@paruluniversity.ac.in', 'Faculty@123', 'faculty')}
                  >
                    Test Faculty Login
                  </Button>
                </CardContent>
              </Card>

              {/* Admin Test */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Admin Login</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> admin@paruluniversity.ac.in</p>
                    <p><strong>Password:</strong> admin123</p>
                    <p><strong>Expected Redirect:</strong> /admin/dashboard</p>
                  </div>
                  <Button 
                    className="mt-3" 
                    onClick={() => testLogin('admin@paruluniversity.ac.in', 'admin123', 'admin')}
                  >
                    Test Admin Login
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900">Instructions:</h3>
            <ol className="list-decimal list-inside text-sm text-blue-800 mt-2 space-y-1">
              <li>Enable mock authentication using the toggle above</li>
              <li>Click on any "Test [Role] Login" button</li>
              <li>You'll be redirected to the login page with pre-filled credentials</li>
              <li>Click the login button to test the authentication flow</li>
              <li>Verify that you're redirected to the correct dashboard</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestAuth;