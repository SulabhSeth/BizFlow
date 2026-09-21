interface ComingSoonProps {
  title: string;
  phase: string;
}

/** Temporary stand-in for routes not yet built, so the new nav has somewhere real to go. */
export function ComingSoon({ title, phase }: ComingSoonProps) {
  return (
    <div className="px-6 py-8 md:px-10">
      <p className="font-display text-2xl text-charcoal">{title}</p>
      <p className="mt-2 text-sm text-charcoal-muted">
        This section is built in {phase}. Check back once that phase lands.
      </p>
    </div>
  );
}