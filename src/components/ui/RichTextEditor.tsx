// ─────────────────────────────────────────────────────────────
// RichTextEditor — TipTap-based WYSIWYG for article content
// ─────────────────────────────────────────────────────────────

"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Undo,
  Redo,
} from "lucide-react";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function MenuButton({
  onClick,
  active,
  children,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors",
        active
          ? "bg-accent/15 text-accent"
          : "text-text-secondary hover:bg-surface-hover hover:text-text",
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Write your article content here...",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-accent underline" },
      }),
      ImageExtension.configure({
        HTMLAttributes: { class: "max-w-full rounded-lg" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[300px] px-4 py-3 text-sm text-text outline-none focus:outline-none leading-relaxed",
      },
    },
    immediatelyRender: false,
  });

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5">
        {/* History */}
        <MenuButton onClick={() => editor.chain().focus().undo().run()} label="Undo">
          <Undo className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().redo().run()} label="Redo">
          <Redo className="h-4 w-4" />
        </MenuButton>

        <div className="mx-1 h-5 w-px bg-border" />

        {/* Text formatting */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          label="Bold"
        >
          <Bold className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          label="Italic"
        >
          <Italic className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          label="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          label="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </MenuButton>

        <div className="mx-1 h-5 w-px bg-border" />

        {/* Headings */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          label="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          label="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          label="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </MenuButton>

        <div className="mx-1 h-5 w-px bg-border" />

        {/* Lists */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          label="Bullet list"
        >
          <List className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          label="Ordered list"
        >
          <ListOrdered className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          label="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          label="Code block"
        >
          <Code className="h-4 w-4" />
        </MenuButton>

        <div className="mx-1 h-5 w-px bg-border" />

        {/* Alignment */}
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          label="Align left"
        >
          <AlignLeft className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          label="Align center"
        >
          <AlignCenter className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          label="Align right"
        >
          <AlignRight className="h-4 w-4" />
        </MenuButton>

        <div className="mx-1 h-5 w-px bg-border" />

        {/* Insert */}
        <MenuButton onClick={addLink} active={editor.isActive("link")} label="Insert link">
          <Link className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={addImage} label="Insert image">
          <Image className="h-4 w-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          label="Horizontal rule"
        >
          <Minus className="h-4 w-4" />
        </MenuButton>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}
