interface Props {
  section: {
    order: number;
    title: string;
    body: string;
  };
}

export function FeedSectionItem({ section }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-3">
        {section.order}. {section.title}
      </h2>
      <p className="text-base leading-relaxed text-muted-foreground">
        {section.body}
      </p>
    </div>
  );
}
