
import { HttpAdapter, ApiAdapter } from '../../../common/api/api.adapter';
import { QuestionResponse } from '../../interface/assistant-response.interface';


export const createThreadUseCase = async () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;

    const apiAdapter: HttpAdapter = new ApiAdapter();


    const getSessionId = () => {
        let sessionId = localStorage.getItem("chat_session_id");

        if (!sessionId) {
            sessionId = crypto.randomUUID();
            localStorage.setItem("chat_session_id", sessionId);
        }

        return sessionId;
    }


    const AsQuestionUseCase = async (prompt: string) => {

        const sessionId = getSessionId();

        const response:QuestionResponse  = await  apiAdapter.post(`${API}/sam-assistant/as-question`,{
            prompt: prompt,
            sessionId: sessionId
        });
        return response;
    }

    const handleResetPatient  = async () => {

        const sessionId = localStorage.getItem("chat_session_id");

        const response  = await  apiAdapter.post(`${API}/sam-assistant/reset-patient`,{
            sessionId: sessionId
        });
        return response;
    }


    return { AsQuestionUseCase, handleResetPatient };

}