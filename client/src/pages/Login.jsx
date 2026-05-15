import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin, requestPasswordReset } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await login(form);
      navigate(location.state?.redirectTo || '/account');
    } catch (error) {
      toast.error(error.message || 'Unable to login');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Login | Khyathi Collections</title>
      </Helmet>
      <section className="section-block">
        <div className="page-shell">
          <div className="mx-auto max-w-lg rounded-[2rem] border border-borderwarm bg-[#fbf7f2] px-6 py-10 shadow-card md:px-10">
            <img src="/logo.png" alt="Khyathi Collections" className="mx-auto h-16 w-16 rounded-full" />
            <h1 className="mt-6 text-center font-heading text-5xl text-primary">Welcome Back</h1>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <input
                type="email"
                required
                className="input-shell"
                placeholder="Email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
              <div className="space-y-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-shell"
                  placeholder="Password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                />
                <div className="flex items-center justify-between text-sm">
                  <button type="button" className="text-muted" onClick={() => setShowPassword((current) => !current)}>
                    {showPassword ? 'Hide password' : 'Show password'}
                  </button>
                  <button
                    type="button"
                    className="font-semibold text-primary"
                    onClick={() => {
                      if (!form.email) {
                        toast.error('Enter your email first');
                        return;
                      }
                      requestPasswordReset(form.email).catch((error) =>
                        toast.error(error.message || 'Unable to send reset'),
                      );
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
              <button type="submit" className="action-button w-full" disabled={saving}>
                {saving ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="my-6 text-center text-sm text-muted">OR</div>
            <button
              type="button"
              className="w-full rounded-full border border-borderwarm bg-white px-6 py-3 text-sm font-semibold text-primary"
              onClick={() => googleLogin().then(() => navigate('/account')).catch((error) => toast.error(error.message))}
            >
              Continue with Google
            </button>

            <p className="mt-6 text-center text-sm text-muted">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-semibold text-primary">
                Register
              </Link>
            </p>
            
          </div>
        </div>
      </section>
    </>
  );
}
