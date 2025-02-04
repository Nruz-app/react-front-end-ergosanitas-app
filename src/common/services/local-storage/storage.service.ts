export const setLocalStorage = (key: string, value: any) => {
    return localStorage.setItem(key, JSON.stringify(value));
  }
  
  // export const getLocalStorage = (key: string) => {
  //   const local = localStorage.getItem(key);
  //   return (local) ? JSON.parse(local) : '';
  // }
  export const getLocalStorage = (key: string) => {
    if (typeof window !== "undefined") {
      try {
        const local = localStorage.getItem(key);
        return local ? JSON.parse(local) : null;
      } catch (error) {
        return null;
      }
    }
    return null;
  };
  
  export const removeLocalStorage = (key: string) => {
    return localStorage.removeItem(key);
  }
  
  