'use client';

import { toast } from "sonner";

export default function ToastDemo() {
  const handleSimpleToast = () => {
    toast("Hello World");
  };

  const handleSuccessToast = () => {
    toast.success("Successfully saved!");
  };

  const handleErrorToast = () => {
    toast.error("Something went wrong");
  };

  const handlePromiseToast = async () => {
    const saveData = () => new Promise((resolve) => setTimeout(resolve, 2000));
    
    toast.promise(saveData(), {
      loading: 'Saving...',
      success: 'Saved successfully',
      error: 'Error saving'
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <button 
        onClick={handleSimpleToast}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Show Simple Toast
      </button>
      
      <button 
        onClick={handleSuccessToast}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Show Success Toast
      </button>
      
      <button 
        onClick={handleErrorToast}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Show Error Toast
      </button>
      
      <button 
        onClick={handlePromiseToast}
        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        Show Promise Toast
      </button>
    </div>
  );
} 