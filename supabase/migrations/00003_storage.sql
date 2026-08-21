-- Agentic Workspace — Storage buckets and policies
-- Object paths are namespaced by workspace id: <workspace_id>/<...>
-- so policies can enforce membership from the first path segment.

insert into storage.buckets (id, name, public)
values
  ('artifacts', 'artifacts', false),
  ('skill-references', 'skill-references', false)
on conflict (id) do nothing;

create policy "members read workspace artifacts"
  on storage.objects for select
  to authenticated
  using (
    bucket_id in ('artifacts', 'skill-references')
    and public.is_workspace_member(((storage.foldername(name))[1])::uuid)
  );

create policy "editors upload workspace artifacts"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('artifacts', 'skill-references')
    and public.can_edit_workspace(((storage.foldername(name))[1])::uuid)
  );

create policy "editors update workspace artifacts"
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('artifacts', 'skill-references')
    and public.can_edit_workspace(((storage.foldername(name))[1])::uuid)
  );

create policy "editors delete workspace artifacts"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('artifacts', 'skill-references')
    and public.can_edit_workspace(((storage.foldername(name))[1])::uuid)
  );
