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
      <h2 className="text-lg font-bold mb-3 md:text-xl">
        {section.order}. {section.title}
      </h2>
      <p className="text-sm leading-relaxed text-secondary-foreground md:text-base">
        {section.body}
      </p>
    </div>
  );
}
