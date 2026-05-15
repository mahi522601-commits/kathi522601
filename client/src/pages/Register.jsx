import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      await register(form);
      navigate('/account');
    } catch (error) {
      toast.error(error.message || 'Unable to create account');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Register | Khyathi Collections</title>
      </Helmet>
      <section className="section-block">
        <div className="page-shell">
          <div className="mx-auto max-w-lg rounded-[2rem] border border-borderwarm bg-[#fbf7f2] px-6 py-10 shadow-card md:px-10">
            <img src="/logo.png" alt="Khyathi Collections" className="mx-auto h-16 w-16 rounded-full" />
            <h1 className="mt-6 text-center font-heading text-5xl text-primary">Create Account</h1>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <input className="input-shell" placeholder="Full Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              <input type="email" className="input-shell" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
              <input className="input-shell" placeholder="Phone (optional)" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              <input type="password" className="input-shell" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
              <input type="password" className="input-shell" placeholder="Confirm Password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} required />
              <button type="submit" className="action-button w-full" disabled={saving}>
                {saving ? 'Creating Account...' : 'Create Account'}
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
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary">
                Login
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
