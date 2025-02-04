import axios from 'axios'; //npm install axios

export interface HttpAdapter {
    
    getToken<T>(url: string):Promise<T>;
    get<T>( url: string,limit :number,offset:number ):Promise<T>;
    post<T>( url: string,dataJson : any ):Promise<T>;
    put<T>( url: string,dataJson : any ):Promise<T>;
    delete<T>( url: string ):Promise<T>;
    
}

export class ApiAdapter implements HttpAdapter {

    private readonly axios = axios;


    async getToken<T>( url: string ): Promise<T> {

        const { data } = await this.axios.get<T>(url);        
        return data;
    }

    async get<T>( url: string,limit :number = 10,offset:number=1 ): Promise<T> {

        const { data } = await this.axios.get<T>(url, { params : { limit, offset} });        
        return data;
    }

    async post<T>( url: string,dataJson : any ): Promise<T> {

        const { data } = await this.axios.post<T>(url,dataJson);        
        return data;
    }

    async put<T>( url: string,dataJson : any ): Promise<T> {

        const { data } = await this.axios.put<T>(url,dataJson);        
        return data;
    }

    async delete<T>( url: string ): Promise<T> {

        const { data } = await this.axios.delete<T>(url);        
        return data;
    }
  
}

