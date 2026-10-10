import { useResource } from "../../hooks/useResource.js";
import { Card, CardBody, CardHeader } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";
import { formatDate } from "../../utils/format.js";

export default function EmployeeAnnouncements() {
  const { items, loading, error } = useResource("/admin/announcements");
  if (loading) return <Spinner />;
  if (error) return <div className="text-sm text-red-600">{error}</div>;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Announcements</h1>
      {items.length === 0 ? <EmptyState title="No announcements" /> : null}
      {items.map((announcement) => (
        <Card key={announcement._id}>
          <CardHeader title={announcement.title} description={formatDate(announcement.publishAt)} />
          <CardBody>
            <p className="text-sm text-slate-700 dark:text-slate-200">{announcement.body}</p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
