
import { HttpAdapter, ApiAdapter } from '../../../common/api/api.adapter';
import { QuestionResponse } from '../../interface/assistant-response.interface';


export const createThreadUseCase = async () => {

    const API = import.meta.env.VITE_API;

    const apiAdapter: HttpAdapter = new ApiAdapter();


    const AsQuestionUseCase = async (prompt: string) => {

        const response:QuestionResponse  = await  apiAdapter.post(`${API}/sam-assistant/as-question`,{
            prompt: prompt
        });
        return response;
    }


    return { AsQuestionUseCase };

}