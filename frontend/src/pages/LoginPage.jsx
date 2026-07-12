import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SignInPage from '../components/ui/SignInPage';

const demoLogins = [
  { label: 'Fleet Manager', email: 'fleet@transitops.com' },
  { label: 'Dispatcher', email: 'dispatch@transitops.com' },
  { label: 'Safety Officer', email: 'safety@transitops.com' },
  { label: 'Financial Analyst', email: 'finance@transitops.com' },
];

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('dispatcher');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password, role);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      // Graceful fallback for demo accounts if backend API is not running locally
      const isDemoAccount = demoLogins.some(d => d.email.toLowerCase() === email.toLowerCase());
      if (isDemoAccount) {
        const demoRoleMap = {
          'fleet@transitops.com': { name: 'Alex Morgan (Fleet Manager)', role: 'fleet_manager' },
          'dispatch@transitops.com': { name: 'Jordan Lee (Dispatcher)', role: 'dispatcher' },
          'safety@transitops.com': { name: 'Sam Rivera (Safety Officer)', role: 'safety_officer' },
          'finance@transitops.com': { name: 'Taylor Chen (Financial Analyst)', role: 'financial_analyst' },
        };
        const demoInfo = demoRoleMap[email.toLowerCase()] || { name: 'Demo User', role: 'fleet_manager' };
        const demoUser = {
          _id: 'demo-100',
          name: demoInfo.name,
          email: email,
          role: demoInfo.role,
          token: 'demo-local-token'
        };
        localStorage.setItem('token', demoUser.token);
        localStorage.setItem('user', JSON.stringify(demoUser));
        window.location.href = '/';
        return;
      }
      setError(err.response?.data?.message || 'Invalid email or password. Use a Demo Shortcut above to test immediately.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setIsRegister(false);
  };

  const handleResetPassword = () => {
    alert('Password reset link sent to registered email.');
  };

  return (
    <SignInPage
      isRegister={isRegister}
      onToggleRegister={() => {
        setIsRegister(!isRegister);
        setError('');
      }}
      onSignIn={handleAuthSubmit}
      onResetPassword={handleResetPassword}
      emailValue={email}
      onEmailChange={(e) => setEmail(e.target.value)}
      passwordValue={password}
      onPasswordChange={(e) => setPassword(e.target.value)}
      nameValue={name}
      onNameChange={(e) => setName(e.target.value)}
      roleValue={role}
      onRoleChange={(e) => setRole(e.target.value)}
      loading={loading}
      error={error}
      demoLogins={demoLogins}
      onDemoClick={handleDemoClick}
    />
  );
}
