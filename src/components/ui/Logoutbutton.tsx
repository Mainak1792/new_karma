'use client';

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
// rfct;
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase-browser";

export default function Logoutbutton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        try {
            setLoading(true);
            const supabase = createClient();
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                throw error;
            }

            // First navigate to login page
            await router.push("/login");
            
            // Then show success message and refresh
            toast.success("Logged out successfully");
            router.refresh();
        } catch (error: any) {
            console.error("Error logging out:", error);
            toast.error("Failed to logout");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button variant="outline" onClick={handleLogout} className="w-24">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Logout"}
        </Button>
    );
}