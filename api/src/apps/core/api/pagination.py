from rest_framework.pagination import PageNumberPagination


class DefaultPagination(PageNumberPagination):
    """Shared page-number pagination for every list endpoint (ADR 0006)."""

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
