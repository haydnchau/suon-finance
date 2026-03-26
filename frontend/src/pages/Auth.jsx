import { useState } from 'react';

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setError('');

    try {
      if (isLogin) {
        // 🌙 LOGIN
        const res = await fetch("http://localhost:5000/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email.toLowerCase(),
            password: form.password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message);
          return;
        }

        localStorage.setItem('currentUser', JSON.stringify(data));
        onLogin(data);

      } else {
        // 🌿 REGISTER

        const cleanUsername = form.username?.trim().toLowerCase();
        const usernameRegex = /^[a-z][a-z0-9]*$/;

        if (!usernameRegex.test(cleanUsername)) {
          setError("Username must start with a letter and contain only lowercase letters and numbers. NO spaces in between pls blud.");
          return;
        }

        const res = await fetch("http://localhost:5000/api/users/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            username: cleanUsername,
            email: form.email.toLowerCase(),
            password: form.password,
            dob: form.dob || null,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message);
          return;
        }

        localStorage.setItem('currentUser', JSON.stringify(data));
        onLogin(data);
      }

    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }
  };

  return (
    <div className="auth-card">
      <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>

      {!isLogin && (
        <>
          <input placeholder="First Name" onChange={e => handleChange('firstName', e.target.value)} />
          <input placeholder="Last Name" onChange={e => handleChange('lastName', e.target.value)} />
          <input placeholder="Username" onChange={e => handleChange('username', e.target.value)} />
        </>
      )}

      <input placeholder="Email or Username" onChange={e => handleChange('email', e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => handleChange('password', e.target.value)} />

      {!isLogin && (
        <>
          <input type="date" onChange={e => handleChange('dob', e.target.value)} />
        </>
      )}

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      <button onClick={handleSubmit}>
        {isLogin ? 'Login' : 'Register'}
      </button>

      <p
        className="auth-switch"
        onClick={() => {
          setIsLogin(!isLogin);
          setError('');
        }}
      >
        {isLogin
          ? "Don't have an account? Register"
          : "Already have an account? Login"}
      </p>
    </div>
  );
}