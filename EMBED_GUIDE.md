# How to Embed on Your Duda Site

## Option 1: Simple Embed (Recommended for Duda)

In your Duda site editor:

1. **Add a Custom HTML element** where you want the form
2. **Paste this code:**

```html
<div id="smart-energy-form" style="width: 100%; max-width: 600px; margin: 0 auto;"></div>

<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

<script type="text/babel">
const API_URL = 'https://YOUR-VERCEL-PROJECT.vercel.app';

function LeadAgent() {
  const [step, setStep] = React.useState(0);
  const [formData, setFormData] = React.useState({
    serviceType: null,
    billProvided: null,
    contractStatus: null,
    meterType: null,
    detailedComparison: null,
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    preferredContact: null,
    additionalInfo: '',
    dayRate: '',
    nightRate: '',
    standingCharge: '',
    capacity: '',
    meterNumber: null,
    propertyAddress: '',
    fullMeterNumber: '',
    contractEndDate: '',
    takeoverDate: '',
    energyUsage: '',
    currentSupplier: '',
    gasDayRate: '',
    gasStandingCharge: '',
    gasUsage: ''
  });
  const [billFile, setBillFile] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState('');
  const fileInputRef = React.useRef(null);

  const getVisibleSteps = () => {
    const steps = [
      'serviceType',
      'billProvided',
      formData.billProvided === 'yes' ? 'uploadBill' : null,
      formData.billProvided === 'no' || formData.billProvided === 'yes' ? 'contractStatus' : null,
    ];

    if (formData.serviceType === 'Electricity') {
      if (formData.billProvided === 'no' && formData.contractStatus) {
        steps.push('detailedComparison');
      }
      if (formData.detailedComparison === 'yes' && formData.contractStatus) {
        steps.push('meterType');
      }
      if (formData.meterType === 'Half-Hourly') {
        steps.push('dayRate', 'nightRate', 'capacity', 'standingCharge');
      } else if (formData.meterType === 'Economy 7' || formData.meterType === 'Single Rate') {
        steps.push('dayRate', 'standingCharge');
        if (formData.meterType === 'Economy 7') {
          steps.push('nightRate');
        }
      }
      if (formData.meterNumber === null) {
        steps.push('meterNumberQuestion');
      }
      if (formData.meterNumber === 'yes') {
        steps.push('fullMeterNumber');
      } else {
        steps.push('propertyAddress');
      }
    }

    if (formData.serviceType === 'Gas') {
      if (formData.billProvided === 'no' && formData.contractStatus) {
        steps.push('detailedComparison');
      }
      if (formData.detailedComparison === 'yes') {
        steps.push('gasDayRate', 'gasStandingCharge');
      }
      steps.push('meterNumberQuestion');
      if (formData.meterNumber === 'yes') {
        steps.push('fullMeterNumber');
      }
    }

    if (formData.serviceType !== 'Water') {
      if (formData.billProvided === 'no' && !formData.contractStatus) {
      } else if (formData.contractStatus) {
        steps.push('contractEndDate');
        if (formData.contractStatus === 'moved') {
          steps.push('takeoverDate');
        }
      }
    }

    if (formData.serviceType !== 'Water' && formData.billProvided === 'no') {
      steps.push('energyUsage');
    }

    steps.push('currentSupplier', 'businessName', 'contactName', 'email', 'phone', 'preferredContact', 'additionalInfo', 'review');

    return steps.filter(s => s !== null);
  };

  const visibleSteps = getVisibleSteps();
  const currentStep = visibleSteps[step];

  const handleNext = () => {
    if (step < visibleSteps.length - 1) {
      setStep(step + 1);
      setError('');
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
      setError('');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBillFile(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (billFile) {
        formDataToSend.append('billFile', billFile);
      }

      const response = await fetch(`${API_URL}/api/submit-lead`, {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      const result = await response.json();
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{
        background: 'white',
        padding: '40px 20px',
        textAlign: 'center',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ margin: '0 0 15px 0', color: '#1ba098', fontSize: '28px' }}>✓ Thank you!</h2>
        <p style={{ margin: '10px 0', color: '#666', lineHeight: '1.6' }}>We've received your energy quote request. Our team will review your details and get back to you shortly.</p>
        <p style={{ color: '#999', fontSize: '13px', marginTop: '20px' }}>A confirmation email has been sent to <strong>{formData.email}</strong></p>
      </div>
    );
  }

  // Render function for each step...
  // (This is a simplified version - the full LeadAgent.jsx has all the step rendering)
  
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(135deg, #1ba098 0%, #16867f 100%)',
        color: 'white',
        padding: '30px 20px',
        textAlign: 'center',
        borderRadius: '8px 8px 0 0'
      }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '600' }}>Get Your Business Energy Quote</h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '14px', opacity: 0.9 }}>Compare prices from 28+ suppliers — no obligation</p>
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          height: '6px',
          borderRadius: '3px',
          overflow: 'hidden',
          marginTop: '15px'
        }}>
          <div style={{
            background: 'white',
            height: '100%',
            borderRadius: '3px',
            width: `${((step + 1) / visibleSteps.length) * 100}%`,
            transition: 'width 0.3s ease'
          }}></div>
        </div>
      </div>

      <div style={{ padding: '30px 20px', background: 'white' }}>
        <p>Step {step + 1} of {visibleSteps.length}</p>
        {/* Render current step here */}
      </div>

      <div style={{ display: 'flex', gap: '10px', padding: '20px', background: '#f9f9f9', borderTop: '1px solid #e0e0e0', borderRadius: '0 0 8px 8px' }}>
        {step > 0 && (
          <button onClick={handlePrevious} style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            background: '#f0f0f0',
            color: '#333'
          }}>
            ← PREVIOUS
          </button>
        )}
        {currentStep !== 'review' && (
          <button onClick={handleNext} style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            background: '#1ba098',
            color: 'white'
          }}>
            NEXT →
          </button>
        )}
        {currentStep === 'review' && (
          <button onClick={handleSubmit} disabled={loading} style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            background: '#1ba098',
            color: 'white'
          }}>
            {loading ? 'SUBMITTING...' : 'SUBMIT'}
          </button>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('smart-energy-form'));
root.render(<LeadAgent />);
</script>

<style>
  /* Your CSS here */
</style>
```

**Replace `YOUR-VERCEL-PROJECT` with your actual Vercel project URL**

---

## Option 2: Advanced Embed (React App)

If your Duda site already uses React, you can import the component directly:

```javascript
import LeadAgent from 'https://YOUR-VERCEL-PROJECT.vercel.app/LeadAgent.jsx';

<LeadAgent apiUrl="https://YOUR-VERCEL-PROJECT.vercel.app" />
```

---

## Testing the Embed

1. Save your Duda changes
2. Visit the page with the embedded form
3. Fill out a quick test submission
4. Check your email (tom@smart-energy.uk)

If the form doesn't appear:
- Check browser console (F12) for errors
- Verify your Vercel project URL is correct
- Make sure CORS is configured in Vercel environment variables

---

## Customization

You can customize the form by editing:
- **Colors**: Change `#1ba098` (teal) to your brand color
- **Text**: Edit the h2/h3 labels
- **Fields**: Add/remove questions in the step logic
- **Styling**: Modify the CSS

---

**Questions? Check SETUP_GUIDE.md for full deployment details.**
