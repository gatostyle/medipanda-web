import { type BoardDetailsResponse, type CommentResponse, createComment, getBoardDetails, toggleLike, toggleLike_1 } from '@/backend';
import { CommunityTrendingList } from '@/custom/components/CommunityTrendingList';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaOutlinedInput } from '@/custom/components/MedipandaOutlinedInput';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { useSession } from '@/hooks/useSession';
import { FixedLinearProgress } from '@/lib/components/FixedLinearProgress';
import { colors } from '@/themes';
import { formatRelativeTime, formatYyyyMmDdHhMm } from '@/lib/utils/dateFormat';
import { MoreHoriz } from '@mui/icons-material';
import { IconButton, Popover, Stack, type StackProps, Typography } from '@mui/material';
import { EditorContent } from '@tiptap/react';
import { type FormEvent, type MouseEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function CommunityDetail() {
  const { session } = useSession();

  const { id: paramId } = useParams();
  const boardPostId = Number(paramId);

  const navigate = useNavigate();
  const [detail, setDetail] = useState<BoardDetailsResponse | null>(null);

  useEffect(() => {
    if (Number.isNaN(boardPostId)) {
      alert('잘못된 접근입니다.');
      navigate('/community/anonymous', { replace: true });
      return;
    }

    fetchDetail(boardPostId);
  }, [boardPostId, navigate]);

  const fetchDetail = async (id: number) => {
    const response = await getBoardDetails(id);

    setDetail(response);
  };

  const { editor } = useMedipandaEditor();

  useEffect(() => {
    if (detail === null) {
      return;
    }

    editor.setEditable(false);
    editor.commands.setContent(detail.content);
  }, [detail, editor]);

  const handleCommentUpdate = () => {
    fetchDetail(boardPostId);
  };

  const handleLike = async () => {
    await toggleLike_1(boardPostId);
    await fetchDetail(boardPostId);
  };

  const [postPopupAnchor, setPostPopupAnchor] = useState<HTMLElement | null>(null);
  const [popupRelatedComment, setPopupRelatedComment] = useState<CommentResponse | null>(null);

  if (!detail) {
    return <FixedLinearProgress />;
  }

  return (
    <>
      <Stack
        direction='row'
        alignItems='flex-start'
        gap='24px'
        sx={{
          marginTop: '40px',
        }}
      >
        <Stack
          sx={{
            flexGrow: 1,
          }}
        >
          <Stack
            gap='5px'
            sx={{
              padding: '20px',
              borderTop: `1px solid ${colors.gray50}`,
            }}
          >
            <Stack direction='row' alignItems='center'>
              <Typography variant='heading4B' sx={{ color: colors.gray80 }}>
                {detail.title}
              </Typography>
              <IconButton
                size='small'
                onClick={event => {
                  setPopupRelatedComment(null);
                  setPostPopupAnchor(event.currentTarget);
                }}
                sx={{
                  marginLeft: 'auto',
                }}
              >
                <MoreHoriz />
              </IconButton>
            </Stack>
            <Typography variant='normalTextB' sx={{ color: colors.gray80 }}>
              {detail.nickname}
            </Typography>
            <Typography variant='normalTextB' sx={{ color: colors.gray50 }}>
              {formatYyyyMmDdHhMm(detail.createdAt)}
            </Typography>
          </Stack>
          <Stack
            gap='20px'
            sx={{
              padding: '40px 20px',
              borderTop: `1px solid ${colors.gray30}`,
              borderBottom: `1px solid ${colors.gray30}`,
            }}
          >
            <EditorContent editor={editor} />

            <Stack direction='row' alignItems='center' gap='30px'>
              <Stack
                direction='row'
                alignItems='center'
                gap='5px'
                onClick={handleLike}
                sx={{
                  borderBottom: `1px solid transparent`,
                  cursor: 'pointer',
                  color: detail.likedByMe ? colors.vividViolet : colors.gray60,
                  '&:hover': {
                    borderColor: colors.gray60,
                    boxSizing: 'border-box',
                  },
                }}
              >
                <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M2.96745 9.27345L7.60252 13.6276C7.65436 13.6763 7.68028 13.7007 7.70496 13.7187C7.88082 13.8475 8.11983 13.8475 8.29569 13.7187C8.32037 13.7007 8.34629 13.6763 8.39813 13.6276L13.0332 9.27344C14.3373 8.04836 14.4957 6.03237 13.3989 4.61868L13.1926 4.35286C11.8805 2.66169 9.24675 2.94531 8.32477 4.87707C8.19454 5.14994 7.80612 5.14994 7.67588 4.87707C6.75391 2.94531 4.12014 2.66169 2.80802 4.35286L2.60178 4.61868C1.50496 6.03237 1.66333 8.04836 2.96745 9.27345Z'
                    stroke='currentColor'
                    strokeWidth='1.5'
                  />
                </svg>
                <Typography variant='smallTextR' sx={{ marginTop: '2px', lineHeight: '16px' }}>
                  {detail.likesCount.toLocaleString()}
                </Typography>
              </Stack>
              <Stack direction='row' alignItems='center' gap='5px'>
                <img src='/assets/icons/icon-chat.svg' />
                <Typography variant='smallTextR' sx={{ color: colors.gray60, marginTop: '2px', lineHeight: '16px' }}>
                  {detail.commentCount.toLocaleString()}
                </Typography>
              </Stack>
              <Stack direction='row' alignItems='center' gap='5px'>
                <img src='/assets/icons/icon-view-alt.svg' />
                <Typography variant='smallTextR' sx={{ color: colors.gray60, marginTop: '2px', lineHeight: '16px' }}>
                  {detail.viewsCount.toLocaleString()}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <CommentSection
            boardPostId={boardPostId}
            comments={detail.comments}
            onUpdate={handleCommentUpdate}
            onClick={(event, comment) => {
              setPopupRelatedComment(comment);
              setPostPopupAnchor(event.currentTarget);
            }}
            sx={{
              marginTop: '20px',
            }}
          />
        </Stack>
        <Stack
          gap='10px'
          sx={{
            width: '400px',
          }}
        >
          <CommunityTrendingList boardType={'ANONYMOUS'} />
        </Stack>
      </Stack>

      <Popover
        open={postPopupAnchor !== null}
        anchorEl={postPopupAnchor}
        onClose={() => setPostPopupAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        elevation={0}
      >
        <Stack>
          {(popupRelatedComment === null && detail.userId === session?.userId) ||
          (popupRelatedComment !== null && popupRelatedComment.userId === session?.userId) ? (
            <>
              <MedipandaButton variant='outlined' color='error'>
                삭제하기
              </MedipandaButton>
              <MedipandaButton variant='outlined'>수정하기</MedipandaButton>
            </>
          ) : (
            <MedipandaButton variant='outlined' color='error'>
              신고하기
            </MedipandaButton>
          )}
        </Stack>
      </Popover>
    </>
  );
}

function CommentSection({
  boardPostId,
  comments,
  onUpdate,
  onClick,
  ...props
}: {
  boardPostId: number;
  comments: CommentResponse[];
  onUpdate: () => Promise<void> | void;
  onClick?: (event: MouseEvent<HTMLElement>, comment: CommentResponse) => void;
} & Omit<StackProps, 'onClick'>): ReturnType<typeof Stack> {
  const { session } = useSession();

  const handleCommentSubmit = async (event: FormEvent<HTMLFormElement>, parentId: number | null) => {
    event.preventDefault();

    const form = event.currentTarget;
    const inputElement = form.elements.namedItem('content') as HTMLInputElement;
    const content = inputElement.value;

    try {
      await createComment(session!.userId, {
        boardPostId,
        parentId: parentId,
        content: content,
      });
      await onUpdate();
      inputElement.value = '';
    } catch (e) {
      console.error('Error creating comment: ', e);
      alert('댓글 작성 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <Stack {...props} gap='20px'>
      {comments
        .filter(comment => comment.parentId === null)
        .map(comment => {
          const replies = comments.filter(comment => comment.parentId === comment.id);

          return (
            <Stack key={comment.id} gap='10px'>
              <Comment comment={comment} replies={replies} onClick={onClick} onUpdate={onUpdate} />
              {replies.map(reply => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  replies={null}
                  onClick={onClick}
                  onUpdate={onUpdate}
                  sx={{
                    padding: '10px 20px',
                    backgroundColor: colors.gray10,
                  }}
                />
              ))}
              <Stack
                component='form'
                onSubmit={event => handleCommentSubmit(event, comment.id)}
                sx={{
                  padding: '20px',
                  backgroundColor: colors.gray10,
                }}
              >
                <MedipandaOutlinedInput
                  name='content'
                  placeholder='댓글을 남겨주세요'
                  fullWidth
                  endAdornment={
                    <MedipandaButton
                      type='submit'
                      variant='contained'
                      size='small'
                      color='secondary'
                      sx={{
                        paddingX: '22px',
                        borderRadius: '20px',
                      }}
                    >
                      등록하기
                    </MedipandaButton>
                  }
                  sx={{
                    height: '43px',
                    backgroundColor: colors.white,
                    border: `1px solid ${colors.gray50}`,
                  }}
                />
              </Stack>
            </Stack>
          );
        })}
      <Stack component='form' onSubmit={event => handleCommentSubmit(event, null)}>
        <MedipandaOutlinedInput
          name='content'
          placeholder='댓글을 남겨주세요'
          fullWidth
          endAdornment={
            <MedipandaButton
              type='submit'
              variant='contained'
              size='small'
              color='secondary'
              sx={{
                paddingX: '22px',
                borderRadius: '20px',
              }}
            >
              등록하기
            </MedipandaButton>
          }
          sx={{
            height: '43px',
            border: `1px solid ${colors.gray50}`,
          }}
        />
      </Stack>
    </Stack>
  );
}

function Comment({
  comment,
  replies,
  onClick,
  onUpdate,
  ...props
}: {
  comment: CommentResponse;
  replies: CommentResponse[] | null;
  onClick?: (event: MouseEvent<HTMLElement>, comment: CommentResponse) => void;
  onUpdate?: () => Promise<void> | void;
} & Omit<StackProps, 'onClick'>): ReturnType<typeof Stack> {
  const handleLike = async () => {
    await toggleLike(comment.id);
    await onUpdate?.();
  };

  return (
    <Stack {...props}>
      <Stack direction='row' alignItems='flex-start'>
        <Stack>
          <Stack direction='row' alignItems='center' gap='5px'>
            <Typography variant='normalTextB' sx={{ color: colors.gray80 }}>
              {comment.nickname}
            </Typography>
            <img src='/assets/tags/tag-my.svg' />
          </Stack>
          <Typography variant='largeTextR' sx={{ color: colors.gray70 }}>
            {comment.content}
          </Typography>
        </Stack>
        <IconButton
          onClick={event => onClick?.(event, comment)}
          size='small'
          sx={{
            marginLeft: 'auto',
          }}
        >
          <MoreHoriz />
        </IconButton>
      </Stack>
      <Stack direction='row' alignItems='center' gap='30px'>
        <Typography variant='smallTextR' sx={{ color: colors.gray60, marginTop: '2px', lineHeight: '16px' }}>
          {formatRelativeTime(comment.createdAt)}
        </Typography>
        <Stack
          direction='row'
          alignItems='center'
          gap='5px'
          onClick={handleLike}
          sx={{
            borderBottom: `1px solid transparent`,
            color: comment.likedByMe ? colors.vividViolet : colors.gray60,
            cursor: 'pointer',
            '&:hover': {
              borderColor: colors.gray60,
              boxSizing: 'border-box',
            },
          }}
        >
          <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M2.96745 9.27345L7.60252 13.6276C7.65436 13.6763 7.68028 13.7007 7.70496 13.7187C7.88082 13.8475 8.11983 13.8475 8.29569 13.7187C8.32037 13.7007 8.34629 13.6763 8.39813 13.6276L13.0332 9.27344C14.3373 8.04836 14.4957 6.03237 13.3989 4.61868L13.1926 4.35286C11.8805 2.66169 9.24675 2.94531 8.32477 4.87707C8.19454 5.14994 7.80612 5.14994 7.67588 4.87707C6.75391 2.94531 4.12014 2.66169 2.80802 4.35286L2.60178 4.61868C1.50496 6.03237 1.66333 8.04836 2.96745 9.27345Z'
              stroke='currentColor'
              strokeWidth='1.5'
            />
          </svg>
          <Typography variant='smallTextR' sx={{ marginTop: '2px', lineHeight: '16px' }}>
            좋아요 {comment.likesCount.toLocaleString()}
          </Typography>
        </Stack>
        {replies !== null && (
          <Stack direction='row' alignItems='center' gap='5px'>
            <img src='/assets/icons/icon-chat.svg' />
            <Typography variant='smallTextR' sx={{ color: colors.gray60, marginTop: '2px', lineHeight: '16px' }}>
              대댓글 {replies.length.toLocaleString()}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
