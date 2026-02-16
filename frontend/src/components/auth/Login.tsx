import { useState } from "react";
import { Link } from "react-router-dom";

// shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// my custom styling for login page


const Login = () => {
  // state for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // simple validation before backend connection
    if (!email || !password) {
      alert("All fields are required");
      return;
    }

    // temporary console log (backend integration later)
    console.log(email, password);
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <CardHeader className="text-center">
          <CardTitle>Welcome Back, Gamer</CardTitle>
          <CardDescription>
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="player@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button className="w-full" type="submit">
              Log In
            </Button>
          </form>

          <p className="switch">
            New to the arena? <Link to="/signup">Create an Account</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
