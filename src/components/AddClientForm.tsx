import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { User, HeartHandshake, CheckCircle2 } from 'lucide-react';

interface AddClientFormProps {
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  onDelete?: () => void;
}

const steps = [
  { label: 'Personal Info', icon: User },
  { label: 'Therapy Info', icon: HeartHandshake },
];

export default function AddClientForm({ onSubmit, onCancel, initialData, onDelete }: AddClientFormProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    occupation: '',
    address: '',
    emergencyContact: '',
    startDate: '',
    therapyType: '',
    primaryConcerns: '',
  });
  const [step, setStep] = useState(1);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        dob: initialData.dob || '',
        occupation: initialData.occupation || '',
        address: initialData.address || '',
        emergencyContact: initialData.emergencyContact || '',
        startDate: initialData.startDate || '',
        therapyType: initialData.therapyType || '',
        primaryConcerns: initialData.primaryConcerns || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onSubmit(form);
    }, 1200);
  };

  const personalInfoValid = form.name.trim() && form.email.trim();
  const therapyInfoValid = form.startDate.trim() && form.therapyType.trim() && form.primaryConcerns.trim();

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isActive = step === idx + 1;
          const isComplete = step > idx + 1 || saved;
          return (
            <div key={s.label} className="flex items-center">
              <div className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'scale-110' : ''}`}>
                <div className={`rounded-full border-2 ${isActive ? 'border-therapy-purple bg-white' : isComplete ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'} w-12 h-12 flex items-center justify-center shadow-md transition-all duration-300`}>
                  {isComplete ? <CheckCircle2 className="w-7 h-7 text-green-400 animate-bounce-in" /> : <Icon className={`w-7 h-7 ${isActive ? 'text-therapy-purple' : 'text-gray-400'}`} />}
                </div>
                <span className={`mt-2 text-sm font-semibold tracking-wide ${isActive ? 'text-therapy-purple' : 'text-gray-400'}`}>{s.label}</span>
              </div>
              {idx < steps.length - 1 && <div className={`w-16 h-1 mx-2 rounded-full ${step > idx + 1 ? 'bg-green-400' : 'bg-gray-200'} transition-all duration-300`} />}
            </div>
          );
        })}
      </div>
      {/* Card Content */}
      <form onSubmit={handleSubmit} className="relative bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-100 px-10 py-8 min-h-[480px] flex flex-col justify-between transition-all duration-500">
        {/* Animated step content */}
        <div className="flex flex-row w-full gap-8 min-h-[320px]">
          {step === 1 && (
            <div className="flex-1 flex flex-col justify-center animate-fade-in">
              <h2 className="text-2xl font-extrabold text-therapy-purple mb-8 tracking-tight pl-1 md:pl-2">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7 items-center">
                <div className="relative">
                  <Input id="name" name="name" value={form.name} onChange={handleChange} required className="peer input-floating px-4" placeholder=" " />
                  <Label htmlFor="name" className="label-floating left-4">Full Name</Label>
                </div>
                <div className="relative">
                  <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required className="peer input-floating px-4" placeholder=" " />
                  <Label htmlFor="email" className="label-floating left-4">Email</Label>
                </div>
                <div className="relative">
                  <Input id="phone" name="phone" value={form.phone} onChange={handleChange} required className="peer input-floating px-4" placeholder=" " />
                  <Label htmlFor="phone" className="label-floating left-4">Phone</Label>
                </div>
                <div className="md:col-span-1 flex flex-col">
                  <Label htmlFor="dob" className="mb-1 block text-gray-500 font-medium pl-1 md:pl-2">Date of Birth</Label>
                  <Input id="dob" name="dob" type="date" value={form.dob} onChange={handleChange} required className="input-floating px-4" placeholder=" " />
                </div>
                <div className="relative md:col-span-2">
                  <Input id="occupation" name="occupation" value={form.occupation} onChange={handleChange} className="peer input-floating px-4" placeholder=" " />
                  <Label htmlFor="occupation" className="label-floating left-4">Occupation</Label>
                </div>
                <div className="relative md:col-span-2">
                  <textarea id="address" name="address" value={form.address} onChange={handleChange} rows={2} className="peer input-floating w-full resize-y px-4 pt-6" placeholder=" " />
                  <Label htmlFor="address" className="label-floating left-4">Address</Label>
                </div>
                <div className="relative md:col-span-2">
                  <Input id="emergencyContact" name="emergencyContact" value={form.emergencyContact} onChange={handleChange} className="peer input-floating px-4" placeholder=" " />
                  <Label htmlFor="emergencyContact" className="label-floating left-4">Emergency Contact</Label>
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="flex-1 flex flex-col justify-center animate-fade-in">
              <h2 className="text-2xl font-extrabold text-therapy-purple mb-8 tracking-tight pl-1 md:pl-2">Therapy Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7 items-center">
                <div className="md:col-span-1 flex flex-col">
                  <Label htmlFor="startDate" className="mb-1 block text-gray-500 font-medium pl-1 md:pl-2">Start Date</Label>
                  <Input id="startDate" name="startDate" type="date" value={form.startDate} onChange={handleChange} className="input-floating px-4" placeholder=" " />
                </div>
                <div className="relative md:col-span-2">
                  <Input id="therapyType" name="therapyType" value={form.therapyType} onChange={handleChange} className="peer input-floating px-4" placeholder=" " />
                  <Label htmlFor="therapyType" className="label-floating left-4">Therapy Type</Label>
                </div>
                <div className="relative md:col-span-2">
                  <textarea id="primaryConcerns" name="primaryConcerns" value={form.primaryConcerns} onChange={handleChange} rows={2} className="peer input-floating w-full resize-y px-4 pt-6" placeholder=" " />
                  <Label htmlFor="primaryConcerns" className="label-floating left-4">Primary Concerns</Label>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Stepper Controls */}
        <div className="flex gap-2 justify-between pt-8 mt-4 pr-2 md:pr-4 items-center">
          {/* Left: Delete button if editing */}
          {initialData ? (
            <Button
              type="button"
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-bold shadow-md transition-all duration-200"
              onClick={() => setShowDeleteConfirm(true)}
              variant="ghost"
            >
              Delete
            </Button>
          ) : <div />}
          {/* Right: Main actions */}
          <div className="flex gap-2">
            {onCancel && <Button type="button" variant="outline" onClick={onCancel} className="rounded-full px-6 py-2">Cancel</Button>}
            {step === 2 && <Button type="button" variant="outline" onClick={() => setStep(1)} className="rounded-full px-6 py-2">Back</Button>}
            {step === 1 && <Button type="button" className="bg-therapy-purple hover:bg-therapy-purpleDeep text-base px-8 py-2 rounded-full shadow-lg font-bold transition-all duration-200" onClick={() => setStep(2)} disabled={!personalInfoValid}>Next</Button>}
            {step === 2 && <Button type="submit" className="bg-therapy-purple hover:bg-therapy-purpleDeep text-base px-8 py-2 rounded-full shadow-lg font-bold transition-all duration-200 flex items-center gap-2" disabled={!therapyInfoValid}>
              {saved ? <CheckCircle2 className="w-5 h-5 animate-bounce-in text-green-400" /> : null}
              {initialData ? (saved ? 'Saved!' : 'Save Changes') : (saved ? 'Added!' : 'Add Client')}
            </Button>}
          </div>
        </div>
        {/* Delete confirmation dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center animate-fade-in">
              <div className="text-xl font-bold text-gray-800 mb-2">Delete Client?</div>
              <div className="text-gray-500 mb-6 text-center">Are you sure you want to delete this client? This action cannot be undone.</div>
              <div className="flex gap-4 w-full justify-center">
                <Button type="button" variant="outline" onClick={() => setShowDeleteConfirm(false)} className="rounded-full px-6 py-2">Cancel</Button>
                <Button type="button" className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-bold shadow-md transition-all duration-200" onClick={() => { setShowDeleteConfirm(false); onDelete && onDelete(); }}>Delete</Button>
              </div>
            </div>
          </div>
        )}
        <style>{`
          .input-floating {
            background: rgba(255,255,255,0.7);
            border-radius: 0.75rem;
            border: 1.5px solid #e5e7eb;
            padding-top: 1.25rem;
            padding-bottom: 0.5rem;
            transition: border 0.2s, box-shadow 0.2s;
            font-size: 1.05rem;
          }
          .input-floating:focus {
            border-color: #9b87f5;
            box-shadow: 0 0 0 2px #9b87f533;
          }
          .label-floating {
            position: absolute;
            left: 1rem;
            top: 0.5rem;
            font-size: 0.95rem;
            color: #a3a3a3;
            pointer-events: none;
            transition: all 0.2s;
            background: transparent;
          }
          .peer:focus ~ .label-floating,
          .peer:not(:placeholder-shown):not(:focus):not([value=""]) ~ .label-floating,
          .peer:valid ~ .label-floating,
          input[type='date'].peer:not([value=""]) ~ .label-floating {
            top: -1.1rem;
            left: 0.75rem;
            font-size: 0.8rem;
            color: #9b87f5;
            background: #fff;
            padding: 0 0.25rem;
            border-radius: 0.5rem;
          }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: none; }
          }
          .animate-fade-in {
            animation: fade-in 0.5s cubic-bezier(.4,0,.2,1);
          }
          @keyframes bounce-in {
            0% { transform: scale(0.7); opacity: 0; }
            60% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); }
          }
          .animate-bounce-in {
            animation: bounce-in 0.5s cubic-bezier(.4,0,.2,1);
          }
        `}</style>
      </form>
    </div>
  );
} 