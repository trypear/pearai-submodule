/* eslint-disable header/header */
import { useState, useEffect } from 'react';
import { Button, vscEditorBackground, vscBackground, vscInputBackground, vscForeground } from '../components';
import styled from 'styled-components';

const GridDiv = styled.div`
  display: grid;
  padding: 2rem;
  justify-items: center;
  align-items: center;
  overflow-y: auto;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  margin: 4px 0;
  background-color: ${vscInputBackground};
  color: ${vscForeground};
  border: 1px solid ${vscInputBackground};
  border-radius: 4px;
  &:focus {
    outline: none;
    border-color: #007acc;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  margin: 4px 0;
  background-color: ${vscInputBackground};
  color: ${vscForeground};
  border: 1px solid ${vscInputBackground};
  border-radius: 4px;
  &:focus {
    outline: none;
    border-color: #007acc;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  margin: 4px 0;
  background-color: ${vscInputBackground};
  color: ${vscForeground};
  border: 1px solid ${vscInputBackground};
  border-radius: 4px;
  &:focus {
    outline: none;
    border-color: #007acc;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  width: 100%;
`;

const StyledLink = styled(Button).attrs({
    as: 'a',
  })<{ href: string; target?: string }>`
    white-space: nowrap;
    text-decoration: none;
  
    &:hover {
      color: inherit;
      text-decoration: none;
    }
  
    @media (max-width: 400px) {
      .icon {
        display: none;
      }
  `;
  
const Label = styled.label`
  display: block;
  margin-bottom: 4px;
  color: ${vscForeground};
`;
function Feedback({ onClose }: { onClose?: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    isSubscribed: 'no',
    subscriptionType: 'none',
    operatingSystem: '',
    feedback: ''
  });

  // Detect OS on component mount
  useEffect(() => {
    const platform = window.navigator.platform.toLowerCase();
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    let detectedOS = '';
    if (platform.includes('linux')) {
      detectedOS = 'Linux';
    } else if (platform.includes('win')) {
      detectedOS = 'Windows';
    } else if (platform.includes('mac')) {
      if (userAgent.includes('mac') && userAgent.includes('arm64')) {
        detectedOS = 'M-chip Mac';
      } else {
        detectedOS = 'Intel Mac';
      }
    }

    setFormData(prev => ({
      ...prev,
      operatingSystem: detectedOS
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'isSubscribed' && value === 'no' ? { subscriptionType: 'none' } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.feedback.trim()) {
      alert('Please enter your feedback before submitting.');
      return;
    }

    const emailSubject = 'PearAI Feedback';
    const emailBody = `
    Feedback:
    ${formData.feedback}

    User Info:
    Name: ${formData.name}
    Email: ${formData.email}
    Subscription Status: ${formData.isSubscribed}
    Subscription Type: ${formData.subscriptionType}
    Operating System: ${formData.operatingSystem}
    `.trim();

    await fetch('/api/send-feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    });

  };

  return (
    <div className='p-2'>
      <GridDiv className='rounded-xl w-3/4 mx-auto' style={{
          backgroundColor: vscEditorBackground,
        }}>
        <h3 className='my-1 text-center mb-0'>Send Feedback</h3>
        <p className='text-center'>Help us improve PearAI by sharing your thoughts</p>
        
        <form onSubmit={handleSubmit} className='w-full'>
          <FormGroup>
            <Label>Name</Label>
            <Input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleChange}
              placeholder='Your name'
          />
          </FormGroup>

          <FormGroup>
            <Label>Email</Label>
            <Input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              placeholder='your.email@example.com'
            />
          </FormGroup>

          <FormGroup>
            <Label>Are you subscribed to PearAI?</Label>
            <Select
              name='isSubscribed'
              value={formData.isSubscribed}
              onChange={handleChange}
            >
              <option value='no'>No</option>
              <option value='yes'>Yes</option>
            </Select>
          </FormGroup>

          {formData.isSubscribed === 'yes' && (
            <FormGroup>
              <Label>Subscription Type</Label>
              <Select
                name='subscriptionType'
                value={formData.subscriptionType}
                onChange={handleChange}
              >
                <option value='monthly'>Monthly</option>
                <option value='yearly'>Yearly</option>
              </Select>
            </FormGroup>
          )}

          <FormGroup>
            <Label>Operating System</Label>
            <Select
              name='operatingSystem'
              value={formData.operatingSystem}
              onChange={handleChange}
            >
              <option value=''>Select OS</option>
              <option value='Linux'>Linux</option>
              <option value='Windows'>Windows</option>
              <option value='Intel Mac'>Mac (Intel)</option>
              <option value='M-chip Mac'>Mac (M-Chip)</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Your Feedback</Label>
            <TextArea
              name='feedback'
              value={formData.feedback}
              onChange={handleChange}
              className='h-32'
              placeholder='Enter your feedback here...'
            />
          </FormGroup>

          <div className='text-center mt-4'>
            <Button type='submit'>Submit Feedback</Button>
          </div>
        </form>
      </GridDiv>
    </div>
  );
}

export default Feedback;
