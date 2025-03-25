import { createServerClient } from "@supabase/ssr";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { prisma } from "@/db/prisma";
import { Note } from "@prisma/client";
import Link from "next/link";
import SidebarGroupContent from "./SidebarGroupContent";
import NewNoteButton from "./ui/NewNoteButton";
import { cookies } from "next/headers";

async function AppSidebar() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: any) {
            cookieStore.delete(name);
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    let notes: Note[] = [];
    
    if (user) {
      try {
        notes = await prisma.note.findMany({
          where: {
            authorId: user.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    }

    return (
      <Sidebar>
        <SidebarContent className="custom-scrollbar">
          <SidebarGroup>
            <SidebarGroupLabel className="mb-2 mt-2 text-lg">
              {user ? (
                "Your Notes"
              ) : (
                <p>
                  <Link href="/login" className="underline">
                    Login
                  </Link>{" "}
                  to see your notes
                </p>
              )}
            </SidebarGroupLabel>
            {user && (
              <>
                <NewNoteButton userId={user.id} />
                <SidebarGroupContent notes={notes} />
              </>
            )}
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  } catch (error) {
    console.error('Error in AppSidebar:', error);
    return (
      <Sidebar>
        <SidebarContent className="custom-scrollbar">
          <SidebarGroup>
            <SidebarGroupLabel className="mb-2 mt-2 text-lg">
              <p>
                <Link href="/login" className="underline">
                  Login
                </Link>{" "}
                to see your notes
              </p>
            </SidebarGroupLabel>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }
}

export default AppSidebar;
