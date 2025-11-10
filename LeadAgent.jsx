import React, { useState, useRef, useEffect } from 'react';
import './LeadAgent.css';

const LeadAgent = ({ apiUrl = 'http://localhost:3001' }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
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
  const [billFile, setBillFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Determine which step to show based on answers
  const getVisibleSteps = () => {
    const steps = [
      'serviceType',
      'billProvided',
      formData.billProvided === 'yes' ? 'uploadBill' : null,
      formData.billProvided === 'no' || formData.billProvided === 'yes' ? 'contractStatus' : null,
    ];

    // Add service-specific questions
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
        // Skip to general questions
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
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add bill file if exists
      if (billFile) {
        formDataToSend.append('billFile', billFile);
      }

      const response = await fetch(`${apiUrl}/api/submit-lead`, {
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
      <div className="lead-agent">
        <div className="success-message">
          <h2>✓ Thank you!</h2>
          <p>We've received your energy quote request. Our team will review your details and get back to you shortly.</p>
          <p className="subtext">A confirmation email has been sent to <strong>{formData.email}</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div className="lead-agent">
      <div className="form-container">
        {/* Header */}
        <div className="form-header">
          <h2>Get Your Business Energy Quote</h2>
          <p>Compare prices from 28+ suppliers — no obligation</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${((step + 1) / visibleSteps.length) * 100}%` }}></div>
          </div>
        </div>

        {/* Form Steps */}
        <div className="form-content">
          {/* Service Type */}
          {currentStep === 'serviceType' && (
            <div className="form-step">
              <h3>Let's get started. Which service would you like a quote for?</h3>
              <div className="button-group">
                {['Electricity', 'Gas', 'Water'].map(service => (
                  <button
                    key={service}
                    className={`option-button ${formData.serviceType === service ? 'selected' : ''}`}
                    onClick={() => handleInputChange('serviceType', service)}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bill Upload */}
          {currentStep === 'billProvided' && (
            <div className="form-step">
              <h3>Got a recent bill to hand?</h3>
              <p>It includes everything we need to quote accurately — and saves you time by skipping a bunch of questions.</p>
              <div className="button-group">
                <button
                  className={`option-button ${formData.billProvided === 'yes' ? 'selected' : ''}`}
                  onClick={() => handleInputChange('billProvided', 'yes')}
                >
                  Yes - I'll upload it now
                </button>
                <button
                  className={`option-button ${formData.billProvided === 'no' ? 'selected' : ''}`}
                  onClick={() => handleInputChange('billProvided', 'no')}
                >
                  No - I don't have it to hand
                </button>
              </div>
            </div>
          )}

          {/* Upload Bill */}
          {currentStep === 'uploadBill' && (
            <div className="form-step">
              <h3>Thanks! Please upload your recent bill below.</h3>
              <p>We'll use it to pull all the key details so you don't have to enter them manually.</p>
              <div className="file-upload-area">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <button
                  className="browse-button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  📁 Browse Files
                </button>
                {billFile && (
                  <div className="file-selected">
                    ✓ {billFile.name}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contract Status */}
          {currentStep === 'contractStatus' && (
            <div className="form-step">
              <h3>What's your current situation with the property?</h3>
              <div className="button-group">
                {[
                  { value: 'in-contract', label: "I'm in a contract" },
                  { value: 'out-contract', label: "I'm out of contract" },
                  { value: 'moved', label: "I've just moved in / new tenant" },
                  { value: 'unsure', label: "I'm not sure" }
                ].map(option => (
                  <button
                    key={option.value}
                    className={`option-button ${formData.contractStatus === option.value ? 'selected' : ''}`}
                    onClick={() => handleInputChange('contractStatus', option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Comparison */}
          {currentStep === 'detailedComparison' && (
            <div className="form-step">
              <h3>Would you like to provide more details (like your current rates or meter type) to get a more detailed cost comparison?</h3>
              <div className="button-group">
                <button
                  className={`option-button ${formData.detailedComparison === 'yes' ? 'selected' : ''}`}
                  onClick={() => handleInputChange('detailedComparison', 'yes')}
                >
                  Yes - I want a detailed comparison
                </button>
                <button
                  className={`option-button ${formData.detailedComparison === 'no' ? 'selected' : ''}`}
                  onClick={() => handleInputChange('detailedComparison', 'no')}
                >
                  No - just give me a general quote for now
                </button>
              </div>
            </div>
          )}

          {/* Meter Type */}
          {currentStep === 'meterType' && (
            <div className="form-step">
              <h3>What type of electricity meter do you have?</h3>
              <div className="button-group">
                {['Single Rate', 'Economy 7 / two-rate', 'Half-Hourly'].map(type => (
                  <button
                    key={type}
                    className={`option-button ${formData.meterType === type ? 'selected' : ''}`}
                    onClick={() => handleInputChange('meterType', type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Day Rate */}
          {currentStep === 'dayRate' && (
            <div className="form-step">
              <h3>What's your current day rate (p/kWh)?</h3>
              <input
                type="text"
                placeholder="e.g. 23.7"
                value={formData.dayRate}
                onChange={(e) => handleInputChange('dayRate', e.target.value)}
                className="text-input"
              />
            </div>
          )}

          {/* Night Rate */}
          {currentStep === 'nightRate' && (
            <div className="form-step">
              <h3>What's your current night rate (p/kWh)?</h3>
              <input
                type="text"
                placeholder="e.g. 12.3"
                value={formData.nightRate}
                onChange={(e) => handleInputChange('nightRate', e.target.value)}
                className="text-input"
              />
            </div>
          )}

          {/* Capacity */}
          {currentStep === 'capacity' && (
            <div className="form-step">
              <h3>What's your available capacity (kVA)?</h3>
              <input
                type="text"
                placeholder="e.g. 45"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
                className="text-input"
              />
            </div>
          )}

          {/* Standing Charge */}
          {currentStep === 'standingCharge' && (
            <div className="form-step">
              <h3>What's your daily standing charge (p/day)?</h3>
              <input
                type="text"
                placeholder="e.g. 62.34"
                value={formData.standingCharge}
                onChange={(e) => handleInputChange('standingCharge', e.target.value)}
                className="text-input"
              />
            </div>
          )}

          {/* Gas Day Rate */}
          {currentStep === 'gasDayRate' && (
            <div className="form-step">
              <h3>What's your current day rate (p/kWh)?</h3>
              <input
                type="text"
                placeholder="e.g. 7.5"
                value={formData.gasDayRate}
                onChange={(e) => handleInputChange('gasDayRate', e.target.value)}
                className="text-input"
              />
            </div>
          )}

          {/* Gas Standing Charge */}
          {currentStep === 'gasStandingCharge' && (
            <div className="form-step">
              <h3>What's your daily standing charge (p/day)?</h3>
              <input
                type="text"
                placeholder="e.g. 33.12"
                value={formData.gasStandingCharge}
                onChange={(e) => handleInputChange('gasStandingCharge', e.target.value)}
                className="text-input"
              />
            </div>
          )}

          {/* Meter Number Question */}
          {currentStep === 'meterNumberQuestion' && (
            <div className="form-step">
              <h3>Do you know your meter number (MPAN, MPRN, SPID)?</h3>
              <div className="button-group">
                <button
                  className={`option-button ${formData.meterNumber === 'yes' ? 'selected' : ''}`}
                  onClick={() => handleInputChange('meterNumber', 'yes')}
                >
                  Yes - I'd like to add it now
                </button>
                <button
                  className={`option-button ${formData.meterNumber === 'no' ? 'selected' : ''}`}
                  onClick={() => handleInputChange('meterNumber', 'no')}
                >
                  No - I don't have it handy
                </button>
              </div>
            </div>
          )}

          {/* Full Meter Number */}
          {currentStep === 'fullMeterNumber' && (
            <div className="form-step">
              <h3>Please enter your meter number here</h3>
              <p style={{ fontSize: '12px', color: '#666' }}>
                MPAN for Electricity, MPRN for Gas, SPID for Water
              </p>
              <input
                type="text"
                placeholder="e.g. 1300001234765 or MPRN / SPID"
                value={formData.fullMeterNumber}
                onChange={(e) => handleInputChange('fullMeterNumber', e.target.value)}
                className="text-input"
              />
            </div>
          )}

          {/* Property Address */}
          {currentStep === 'propertyAddress' && (
            <div className="form-step">
              <h3>What's the full address of the property?</h3>
              <p style={{ fontSize: '12px', color: '#666' }}>We'll use this to look up your supply details securely.</p>
              <input
                type="text"
                placeholder="e.g. 123 High Street, Manchester, M1 1AA"
                value={formData.propertyAddress}
                onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
                className="text-input"
              />
            </div>
          )}

          {/* Contract End Date */}
          {currentStep === 'contractEndDate' && (
            <div className="form-step">
              <h3>What's your current contract end date?</h3>
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={formData.contractEndDate}
                onChange={(e) => handleInputChange('contractEndDate', e.target.value)}
                className="text-input"
              />
            </div>
          )}

          {/* Takeover Date */}
          {currentStep === 'takeoverDate' && (
            <div className="form-step">
              <h3>When did you take over the site?</h3>
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={formData.takeoverDate}
                onChange={(e) => handleInputChange('takeoverDate', e.target.value)}
                className="text-input"
              />
            </div>
          )}

          {/* Energy Usage */}
          {currentStep === 'energyUsage' && (
            <div className="form-step">
              <h3>Roughly how much energy does your business use each year?</h3>
              <select
                value={formData.energyUsage}
                onChange={(e) => handleInputChange('energyUsage', e.target.value)}
                className="text-input"
              >
                <option value="">Please Select</option>
                <option value="low">Low (under £2,000/year)</option>
                <option value="medium">Medium (£2,000-£5,000/year)</option>
                <option value="high">High (£5,000-£10,000/year)</option>
                <option value="very-high">Very High (over £10,000/year)</option>
              </select>
            </div>
          )}

          {/* Current Supplier */}
          {currentStep === 'currentSupplier' && (
            <div className="form-step">
              <h3>Who is your current supplier?</h3>
              <input
                type="text"
                placeholder="e.g. EDF, British Gas, Octopus"
                value={formData.currentSupplier}
                onChange={(e) => handleInputChange('currentSupplier', e.target.value)}
                className="text-input"
              />
            </div>
          )}

          {/* Business Name */}
          {currentStep === 'businessName' && (
            <div className="form-step">
              <h3>What's the name of your business (as shown on your bill)?</h3>
              <input
                type="text"
                placeholder="e.g. ABC Services Ltd or John Smith T/A Plumbing"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="text-input"
              />
            </div>
          )}

          {/* Contact Name */}
          {currentStep === 'contactName' && (
            <div className="form-step">
              <h3>What's your name?</h3>
              <input
                type="text"
                placeholder="Your first name"
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                className="text-input"
              />
            </div>
          )}

          {/* Email */}
          {currentStep === 'email' && (
            <div className="form-step">
              <h3>What's the best email to send your quote to?</h3>
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="text-input"
              />
            </div>
          )}

          {/* Phone */}
          {currentStep === 'phone' && (
            <div className="form-step">
              <h3>Phone number (optional — we'll only call if needed)</h3>
              <input
                type="tel"
                placeholder="Enter your number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="text-input"
              />
            </div>
          )}

          {/* Preferred Contact */}
          {currentStep === 'preferredContact' && (
            <div className="form-step">
              <h3>How would you like to receive your quote?</h3>
              <div className="button-group">
                {[
                  { value: 'email', label: 'Email Only' },
                  { value: 'call', label: 'Give me a call' },
                  { value: 'either', label: 'Either is fine' }
                ].map(option => (
                  <button
                    key={option.value}
                    className={`option-button ${formData.preferredContact === option.value ? 'selected' : ''}`}
                    onClick={() => handleInputChange('preferredContact', option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          {currentStep === 'additionalInfo' && (
            <div className="form-step">
              <h3>Is there anything else we should know before quoting?</h3>
              <textarea
                placeholder="Let us know if you have preferred contract lengths, want renewable-only quotes, or would like to avoid certain suppliers."
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                className="text-input textarea"
                rows="4"
              />
            </div>
          )}

          {/* Review */}
          {currentStep === 'review' && (
            <div className="form-step">
              <h3>Almost done! Let's review your details</h3>
              <div className="review-box">
                <p><strong>Service Type:</strong> {formData.serviceType}</p>
                <p><strong>Contact:</strong> {formData.contactName} ({formData.email})</p>
                <p><strong>Business:</strong> {formData.businessName}</p>
                {billFile && <p><strong>Bill:</strong> {billFile.name} ✓</p>}
                {formData.additionalInfo && <p><strong>Notes:</strong> {formData.additionalInfo}</p>}
              </div>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '15px' }}>
                ✓ We'll never share your information with 3rd parties. Your data stays private until you agree to switch.
              </p>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
        </div>

        {/* Navigation */}
        <div className="form-navigation">
          {step > 0 && (
            <button className="nav-button prev" onClick={handlePrevious}>
              ← PREVIOUS
            </button>
          )}
          {currentStep !== 'review' && (
            <button className="nav-button next" onClick={handleNext}>
              NEXT →
            </button>
          )}
          {currentStep === 'review' && (
            <button
              className="nav-button submit"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'SUBMITTING...' : 'SUBMIT'}
            </button>
          )}
        </div>

        <div className="progress-indicator">
          Step {step + 1} of {visibleSteps.length}
        </div>
      </div>
    </div>
  );
};

export default LeadAgent;
