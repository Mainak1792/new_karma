'use client';

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

type Props = {
    type: 'login' | 'register'
}

export default function AuthForm({ type }: Props) {
    const isLoginForm = type === 'login';
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        // Basic validation
        if (!email || !password) {
            toast.error("Please fill in all fields");
            return;
        }

        startTransition(async () => {
            try {
                const supabase = createClient();
                
                if (isLoginForm) {
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email,
                        password,
                    });

                    if (error) throw error;

                    toast.success("Login successful!");
                    router.push("/");
                    router.refresh();
                } else {
                    // Register new user in Supabase only
                    const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            emailRedirectTo: 'https://new-karma-weld.vercel.app/auth/callback',
                        },
                    });

                    if (error) throw error;

                    // Show success message and redirect to login
                    toast.success("Registration successful! Please check your email to verify your account.");
                    router.push("/login");
                }
            } catch (error: any) {
                console.error('Form submission error:', error);
                toast.error(error.message || "Something went wrong. Please try again.");
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    disabled={isPending}
                />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    disabled={isPending}
                />
            </div>

            <div className="space-y-4">
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isLoginForm ? "Login" : "Register"}
                </Button>

                <div className="text-center text-sm">
                    {isLoginForm ? "Don't have an account yet? " : "Already have an account? "}
                    <Link 
                        href={isLoginForm ? "/register" : "/login"} 
                        className={`text-blue-500 underline ${isPending ? "pointer-events-none opacity-60" : ""}`}
                    >
                        {isLoginForm ? "Register" : "Login"}
                    </Link>
                </div>
            </div>
        </form>
    );
}