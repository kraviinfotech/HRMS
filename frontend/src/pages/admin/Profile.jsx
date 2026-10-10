import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card, CardBody, CardHeader } from "../../components/ui/Card.jsx";

export default function Profile() {
  const { user } = useAuth();
  return (
    <Card>
      <CardHeader title="Admin Profile" action={<Link to="/admin/change-password"><Button variant="secondary">Change password</Button></Link>} />
      <CardBody className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase text-slate-500">Name</p>
          <p className="mt-1 font-medium">{user.name}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-500">Email</p>
          <p className="mt-1 font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-500">Role</p>
          <p className="mt-1 font-medium capitalize">{user.role}</p>
        </div>
      </CardBody>
    </Card>
  );
}
