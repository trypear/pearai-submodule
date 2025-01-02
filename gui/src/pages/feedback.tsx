/* eslint-disable header/header */
import { useState, useEffect, useContext } from 'react';
import { Button, vscEditorBackground, vscBackground, vscInputBackground, vscForeground } from '../components';
import styled from 'styled-components';
import { useNavigate } from "react-router-dom";
import { useNavigationListener } from "../hooks/useNavigationListener";
import { IdeMessengerContext } from '../context/IdeMessenger';
import { getHeaders } from '../../../core/pearaiServer/stubs/headers';
import { SERVER_URL } from '../../../core/util/parameters';

const GridDiv = styled.div`
  display: grid;
  padding: 2rem;
  justify-items: center;
  align-items: center;
  overflow-y: auto;
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
  
const Label = styled.label`
  display: block;
  margin-bottom: 4px;
  color: ${vscForeground};
`;

function Feedback() {
    useNavigationListener();
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState<string>('');
    const ideMessenger = useContext(IdeMessengerContext);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const auth = await ideMessenger.request('getPearAuth', undefined);
                if (auth?.accessToken) {
                    setAccessToken(auth.accessToken);
                } else {
                    ideMessenger.ide.errorPopup("Please login to PearAI");
                }
            } catch (error) {
                console.error("Error initializing authentication:", error);
                ideMessenger.ide.errorPopup("Failed to retrieve authentication. Please try again.");
            }
        };
        initializeAuth();
    }, [ideMessenger]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!accessToken) {
            ideMessenger.ide.errorPopup("Please login to PearAI");
            return;
        }

        const response = await fetch(`${SERVER_URL}/client_feedback`, {
            method: 'POST',
            headers: {
                ...(await getHeaders()),
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ feedback })
        });

        if (!response.ok) {
            const errorMessage = `Status: ${response.status} - ${response.statusText}`;
            ideMessenger.ide.errorPopup(`Failed to send feedback. ${errorMessage}`);
            return;
        }

        ideMessenger.ide.infoPopup('Feedback sent successfully!');
        navigate("/");
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
                        <Label>Your Feedback</Label>
                        <TextArea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
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
