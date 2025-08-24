import { useFormik } from 'formik';
import { useCallback, useEffect, useRef, useState } from 'react';

const defaultInitialFormValues = {};

const defaultContentSelector = <T>(response: T) => response;

const defaultPageCountSelector = () => 1;

interface PageFetchBaseRequest {
  pageIndex: number;
  pageSize: number;
}

interface UsePageFetchFormikOptions<Form, Response, Content, InitialContent extends Content | undefined> {
  initialFormValues: Form;
  fetcher: (values: Form & PageFetchBaseRequest) => Promise<Response>;
  contentSelector: (response: Response) => Content;
  pageCountSelector?: (response: Response) => number;
  initialContent?: InitialContent;
  onFetch?: () => void;
}

interface UsePageFetchFormikReturn<Form, Content> {
  content: Content;
  pageCount: number;
  formik: ReturnType<typeof useFormik<Form & PageFetchBaseRequest>>;
  refresh: () => Promise<void>;
}

export function usePageFetchFormik<Form, Response, Content, InitialContent extends Content | undefined>(
  props: UsePageFetchFormikOptions<Form, Response, Content, InitialContent>,
): UsePageFetchFormikReturn<Form, InitialContent extends Content ? Content : Content | null>;

export function usePageFetchFormik<Response, Content, InitialContent extends Content | undefined>(
  props: Omit<UsePageFetchFormikOptions<object, Response, Content, InitialContent>, 'initialFormValues'>,
): UsePageFetchFormikReturn<object, InitialContent extends Content ? Content : Content | null>;

export function usePageFetchFormik<Form, Response, InitialContent extends Response | undefined>(
  props: Omit<UsePageFetchFormikOptions<Form, Response, Response, InitialContent>, 'contentSelector'>,
): UsePageFetchFormikReturn<Form, InitialContent extends Response ? Response : Response | null>;

export function usePageFetchFormik<Response, InitialContent extends Response | undefined>(
  props: Omit<UsePageFetchFormikOptions<object, Response, Response, InitialContent>, 'initialFormValues' | 'contentSelector'>,
): UsePageFetchFormikReturn<object, InitialContent extends Response ? Response : Response | null>;

export function usePageFetchFormik<Form, Response, Content, InitialContent extends Content | undefined>(
  props: Omit<UsePageFetchFormikOptions<Form, Response, Content, InitialContent>, 'initialFormValues' | 'contentSelector'> &
    Partial<UsePageFetchFormikOptions<Form, Response, Content, InitialContent>>,
): UsePageFetchFormikReturn<Form, InitialContent extends Content ? Content : Content | null> {
  const initialFormValues = useRef(props.initialFormValues ?? (defaultInitialFormValues as Form));
  const fetcher = useRef(props.fetcher);
  const contentSelector = useRef(props.contentSelector ?? defaultContentSelector<Response>);
  const pageCountSelector = useRef(props.pageCountSelector ?? defaultPageCountSelector);
  const initialContent = useRef(props.initialContent ?? null);
  const onFetch = useRef(props.onFetch ?? null);

  const [content, setContent] = useState<Response | Content | null>(initialContent.current);
  const [pageCount, setPageCount] = useState(-1);

  const formik = useFormik({
    initialValues: {
      ...initialFormValues.current,
      pageIndex: 0,
      pageSize: 10,
    },
    onSubmit: async (values, { setFieldValue }) => {
      if (values.pageIndex !== 0) {
        await setFieldValue('pageIndex', 0);
      } else {
        await fetchData();
      }
    },
  });

  const fetchData = useCallback(async () => {
    const response: Response = await fetcher.current(formik.values);

    setContent(contentSelector.current(response));
    setPageCount(pageCountSelector.current(response));

    onFetch.current?.();
  }, [formik.values]);

  const refresh = useCallback(() => fetchData(), [fetchData]);

  useEffect(() => {
    fetchData();
  }, [formik.values.pageIndex, formik.values.pageSize]);

  return {
    formik,
    content: content as Content,
    pageCount,
    refresh,
  };
}
