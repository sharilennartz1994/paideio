import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="slanted-divider mt-20 w-full border-t-4 border-secondary-fixed bg-surface-container-lowest py-12 md:pl-20">
      <div className="un-skew flex flex-col items-center justify-between gap-8 px-4 md:flex-row md:px-16">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <div className="font-heading text-headline-md tracking-tighter text-primary uppercase italic">
            Paideio
          </div>
          <p className="font-sans text-sm text-on-surface-variant">
            © {year} Paideio — dal greco antico παιδεία, la formazione della persona attraverso lo sport.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <Link href="/cerca" className="text-sm text-on-surface-variant transition-colors hover:text-primary">
            Trova un coach
          </Link>
          <Link href="/diventa-coach" className="text-sm text-on-surface-variant transition-colors hover:text-primary">
            Diventa coach
          </Link>
          <Link href="/chi-siamo" className="text-sm text-on-surface-variant transition-colors hover:text-primary">
            Il concept
          </Link>
        </div>
      </div>
    </footer>
  );
}
