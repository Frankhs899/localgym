"""Views for the config project."""

from django.conf import settings
from django.http import Http404, HttpResponse


def spa(request, **kwargs):
    """Serve the compiled SPA entry point (D3, issue #3).

    WhiteNoise already serves the built assets (WHITENOISE_ROOT); this view
    covers the site root and client-side routes, which are not files. The
    entry point is read in one shot and returned without an open file
    handle (Windows keeps FileResponse handles open, which locks the file),
    and a missing build returns 404 so an incomplete install fails loudly
    instead of serving a stale entry point.
    """
    index = settings.FRONTEND_DIST / 'index.html'
    try:
        content = index.read_bytes()
    except FileNotFoundError:
        raise Http404('Frontend build not found; run the frontend build step.')
    return HttpResponse(content, content_type='text/html')
