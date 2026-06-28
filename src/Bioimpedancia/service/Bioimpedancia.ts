import { HttpAdapter, ApiAdapter } from '../../common/api/api.adapter';
import { IBioimpedanciaAll, IBioimpedanciaForm } from '../interface/bioimpedancia.interface';

export const  BioimpedanciaService = async () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;
    
    const apiAdapter: HttpAdapter = new ApiAdapter();


    const postUploadFile = async(selectedFile : File,formData : IBioimpedanciaForm) => {

        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        uploadData.append('rut', formData.rut);

        const response = await  apiAdapter.post<{success:boolean,message:string,data:any}>
        (`${API}/bioimpedancia/form-upload`,uploadData);
        
        return response;
    }
    const postCreateBio = async(formData : IBioimpedanciaForm) => {

        
        const response = await  apiAdapter.post<{success:boolean,message:string,data:any}>
        (`${API}/bioimpedancia/create-bio`,formData);
        
        return response;
    }

    const getListAll = async() => {
        const response = await  
        apiAdapter.get<{success:boolean,message:string,data:IBioimpedanciaAll[]}>(`${API}/bioimpedancia/list-all`,10,1);
        return response;

    }

    return {
        postCreateBio,
        getListAll,
        postUploadFile   
    }
}