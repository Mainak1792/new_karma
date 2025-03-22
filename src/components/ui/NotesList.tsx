'use client';

import { useEffect, useState } from "react";
import { Note } from "@prisma/client";
import { getNotesAction } from "@/actions/notes";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "./sidebar";
import { FileText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  userId: string;
};

export default function NotesList({ userId }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const fetchNotes = async () => {
    try {
      const { notes, errorMessage } = await getNotesAction(userId);
      if (errorMessage) {
        console.error('Error fetching notes:', errorMessage);
        return;
      }
      setNotes(notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [userId]);

  const handleNoteUpdate = (updatedNote: Note) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === updatedNote.id ? updatedNote : note
      )
    );
  };

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton disabled>
            Loading notes...
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      {notes.map((note) => (
        <SidebarMenuItem key={note.id}>
          <Link href={`/notes/${note.id}`} className="w-full">
            <SidebarMenuButton
              isActive={pathname === `/notes/${note.id}`}
              tooltip={note.text.slice(0, 50) + (note.text.length > 50 ? '...' : '')}
            >
              <FileText className="mr-2 h-4 w-4" />
              {note.text.slice(0, 20) + (note.text.length > 20 ? '...' : '')}
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
} 