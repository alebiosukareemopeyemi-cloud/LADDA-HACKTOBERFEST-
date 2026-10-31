export type Builder = {
  name: string;
  role: string;
  bio: string;
  photo: string | null; // put a path like "/kareem.jpg" (file in /public) when you have one
  links: { label: string; href: string }[];
};

// One founder card. Edit the bio and add links whenever you like.
export const builders: Builder[] = [
  {
    name: "Alebiosu Kareem",
    role: "Founder and builder",
    bio: "Full stack developer building Ladda solo, so students can prove real skills and get hired.",
    photo: null,
    links: [],
  },
];