-- ============================================================================
-- Fix: SECURITY DEFINER functions for admin news operations
-- Bypasses RLS so admins can always insert/delete articles.
-- ============================================================================

create or replace function public.admin_delete_article(article_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  _caller_id uuid;
  _caller_role text;
begin
  _caller_id := auth.uid();
  if _caller_id is null then
    raise exception 'Authentication required';
  end if;

  select role into _caller_role
  from public.users
  where id = _caller_id;

  if _caller_role is distinct from 'admin' then
    raise exception 'Admin privileges required';
  end if;

  delete from public.news_articles
  where id = article_id;
end;
$$;

create or replace function public.admin_insert_article(
  _title text,
  _slug text,
  _content text,
  _excerpt text default null,
  _cover_image text default null,
  _status text default 'draft'
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  _caller_id uuid;
  _caller_role text;
  _article public.news_articles;
begin
  _caller_id := auth.uid();
  if _caller_id is null then
    raise exception 'Authentication required';
  end if;

  select role into _caller_role
  from public.users
  where id = _caller_id;

  if _caller_role is distinct from 'admin' then
    raise exception 'Admin privileges required';
  end if;

  insert into public.news_articles (title, slug, content, excerpt, cover_image, status, author_id)
  values (_title, _slug, _content, _excerpt, _cover_image, _status::public.article_status, _caller_id)
  returning * into _article;

  return row_to_json(_article)::json;
end;
$$;

create or replace function public.admin_update_article(
  _article_id uuid,
  _title text default null,
  _slug text default null,
  _content text default null,
  _excerpt text default null,
  _cover_image text default null,
  _status text default null
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  _caller_id uuid;
  _caller_role text;
  _article public.news_articles;
begin
  _caller_id := auth.uid();
  if _caller_id is null then
    raise exception 'Authentication required';
  end if;

  select role into _caller_role
  from public.users
  where id = _caller_id;

  if _caller_role is distinct from 'admin' then
    raise exception 'Admin privileges required';
  end if;

  update public.news_articles
  set
    title = coalesce(_title, title),
    slug = coalesce(_slug, slug),
    content = coalesce(_content, content),
    excerpt = coalesce(_excerpt, excerpt),
    cover_image = coalesce(_cover_image, cover_image),
    status = coalesce(_status::public.article_status, status),
    published_at = case
      when _status = 'published' and published_at is null then now()
      else published_at
    end
  where id = _article_id and deleted_at is null
  returning * into _article;

  if _article.id is null then
    raise exception 'Article not found';
  end if;

  return row_to_json(_article)::json;
end;
$$;
