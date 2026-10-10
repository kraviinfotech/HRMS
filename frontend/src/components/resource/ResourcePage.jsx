import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "../../api/client.js";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";
import { useResource } from "../../hooks/useResource.js";
import { Button } from "../ui/Button.jsx";
import { Card, CardBody, CardHeader } from "../ui/Card.jsx";
import { ConfirmDialog } from "../ui/ConfirmDialog.jsx";
import { DataTable } from "../ui/DataTable.jsx";
import { Modal } from "../ui/Modal.jsx";
import { Select } from "../ui/Select.jsx";
import { ResourceForm } from "./ResourceForm.jsx";

export function ResourcePage({
  title,
  endpoint,
  createEndpoint,
  columns,
  fields = [],
  createLabel = "New",
  createSuccess = "Saved successfully",
  emptyTitle,
  filters = [],
  rowActions = [],
  transformPayload = (payload) => payload,
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const { loading: actionLoading, run } = useAsyncAction();

  const params = useMemo(() => ({ page, search: search || undefined, ...filterValues }), [page, search, filterValues]);
  const { items, meta, loading, error, reload } = useResource(endpoint, params);

  const tableColumns = useMemo(
    () =>
      rowActions.length
        ? [
            ...columns,
            {
              key: "actions",
              label: "Actions",
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  {rowActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={action.label}
                        variant={action.variant || "secondary"}
                        icon={Icon}
                        disabled={action.disabled?.(row)}
                        onClick={() => setConfirm({ action, row })}
                      >
                        {action.label}
                      </Button>
                    );
                  })}
                </div>
              ),
            },
          ]
        : columns,
    [columns, rowActions],
  );

  async function submit(payload) {
    await run(async () => api.post(createEndpoint || endpoint, transformPayload(payload)), createSuccess);
    setModalOpen(false);
    reload();
  }

  async function confirmAction() {
    const { action, row } = confirm;
    await run(async () => {
      if (action.run) {
        return action.run(row);
      }
      const method = action.method || "patch";
      const path = typeof action.path === "function" ? action.path(row) : `${endpoint}/${row._id}`;
      const body = typeof action.body === "function" ? action.body(row) : action.body || {};
      return api[method](path, body);
    }, action.success || "Action completed");
    setConfirm(null);
    reload();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">{title}</h1>
        {fields.length ? (
          <Button icon={Plus} onClick={() => setModalOpen(true)}>
            {createLabel}
          </Button>
        ) : null}
      </div>

      {filters.length ? (
        <Card>
          <CardBody className="grid gap-3 sm:grid-cols-3">
            {filters.map((filter) => (
              <Select
                key={filter.name}
                label={filter.label}
                value={filterValues[filter.name] || ""}
                options={[{ label: "All", value: "" }, ...filter.options]}
                onChange={(event) => {
                  setPage(1);
                  setFilterValues((current) => ({ ...current, [filter.name]: event.target.value || undefined }));
                }}
              />
            ))}
          </CardBody>
        </Card>
      ) : null}

      <DataTable
        columns={tableColumns}
        rows={items}
        loading={loading}
        error={error}
        meta={meta}
        onPage={setPage}
        search={search}
        onSearch={(value) => {
          setPage(1);
          setSearch(value);
        }}
        emptyTitle={emptyTitle}
      />

      <Modal open={modalOpen} title={createLabel} onClose={() => setModalOpen(false)}>
        <ResourceForm fields={fields} onSubmit={submit} loading={actionLoading} submitLabel={createLabel} />
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.action.confirmTitle || confirm?.action.label}
        message={confirm?.action.confirmMessage || "Please confirm this action."}
        confirmLabel={confirm?.action.label}
        loading={actionLoading}
        onCancel={() => setConfirm(null)}
        onConfirm={confirmAction}
      />
    </div>
  );
}
