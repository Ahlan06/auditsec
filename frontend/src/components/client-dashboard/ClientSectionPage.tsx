type Props = {
  title: string;
  description: string;
};

export default function ClientSectionPage({ title, description }: Props) {
  return (
    <div className="space-y-4">
      <h1 className="section-title">{title}</h1>
      <div className="apple-card p-6">
        <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </div>
  );
}
