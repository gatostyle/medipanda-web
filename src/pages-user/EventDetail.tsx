import { type EventBoardDetailsResponse, getEventBoardDetails, createPromotionToken } from '@/backend';
import { MedipandaEditorContent } from '@/components/MedipandaTiptapContainer';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { FixedLinearProgress } from '@/lib/components/FixedLinearProgress';
import { colors } from '@/themes';
import { DateUtils, DATEFORMAT_YYYY_MM_DD } from '@/lib/utils/dateFormat';
import { Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// 이벤트 URL인지 확인하는 함수
const isEventUrl = (url: string): boolean => {
  try {
    const uri = new URL(url);

    const allowedDomains = ['medipanda.co.kr', 'dev.medipanda.co.kr'];
    if (!allowedDomains.includes(uri.hostname)) {
      return false;
    }

    const eventPatterns = [
      /\/event\d*\.html$/, // event1.html, event2.html
      /\/promotion.*\.html$/, // promotion-wine.html
      /\/special\/.*\.html$/, // special/wine-event.html
    ];

    return eventPatterns.some(pattern => pattern.test(uri.pathname));
  } catch (e) {
    console.error('URL 파싱 오류:', e);
    return false;
  }
};

const launchPromotionPage = async (targetUrl: string) => {
  try {
    console.log('프로모션 토큰 요청 시작');

    const { token } = await createPromotionToken();

    console.log('프로모션 토큰 받음, 페이지 열기');

    // 클라이언트에서 URL 구성
    const promotionUrl = `${targetUrl}?data=${token}`;

    // 모바일/데스크톱 구분해서 페이지 열기
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = promotionUrl;
    } else {
      window.open(promotionUrl, '_blank', 'width=600,height=800,scrollbars=yes');
    }
  } catch (error) {
    console.error('프로모션 페이지 실행 오류:', error);
    alert('프로모션 페이지를 열 수 없습니다. 다시 시도해주세요.');
  }
};

export default function EventDetail() {
  const { id: paramId } = useParams();
  const eventId = Number(paramId);

  const navigate = useNavigate();
  const [detail, setDetail] = useState<EventBoardDetailsResponse | null>(null);

  useEffect(() => {
    if (Number.isNaN(eventId)) {
      alert('잘못된 접근입니다.');
      navigate('/events', { replace: true });
      return;
    }

    fetchDetail(eventId);
  }, [eventId, navigate]);

  const fetchDetail = async (id: number) => {
    const response = await getEventBoardDetails(id);
    setDetail(response);
  };

  const handleLinkClick = async (url: string, event: Event) => {
    event.preventDefault();

    if (isEventUrl(url)) {
      console.log('프로모션 URL 감지됨:', url);
      await launchPromotionPage(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const { editor } = useMedipandaEditor();

  useEffect(() => {
    if (detail === null) {
      return;
    }

    editor.setEditable(false);
    editor.commands.setContent(detail.boardPostDetail.content);

    const editorElement = editor.view.dom;

    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement;

      const linkElement = target.tagName === 'A' ? target : target.closest('a');

      if (linkElement) {
        const url = (linkElement as HTMLAnchorElement).href;

        if (url) {
          handleLinkClick(url, event);
        }
      }
    };

    editorElement.addEventListener('click', handleClick);

    // cleanup
    return () => {
      editorElement.removeEventListener('click', handleClick);
    };
  }, [detail, editor]);

  if (!detail) {
    return <FixedLinearProgress />;
  }

  return (
    <>
      <Typography variant='headingPc3M' sx={{ color: colors.gray80 }}>
        이벤트
      </Typography>

      <Stack
        gap='5px'
        sx={{
          width: '100%',
          padding: '20px',
          marginTop: '30px',
          borderTop: `1px solid ${colors.gray50}`,
        }}
      >
        <Typography variant='headingPc4B' sx={{ color: colors.gray80 }}>
          {detail.boardPostDetail.title}
        </Typography>
        <Typography variant='normalPcR' sx={{ color: colors.gray80 }}>
          {detail.description}
        </Typography>
        <Typography variant='smallPcR' sx={{ color: colors.gray50 }}>
          {DateUtils.parseUtcAndFormatKst(detail.eventStartDate, DATEFORMAT_YYYY_MM_DD)} ~{' '}
          {DateUtils.parseUtcAndFormatKst(detail.eventEndDate, DATEFORMAT_YYYY_MM_DD)} | 조회수{' '}
          {detail.boardPostDetail.viewsCount.toLocaleString()}
        </Typography>
      </Stack>

      <MedipandaEditorContent editor={editor} />
    </>
  );
}
