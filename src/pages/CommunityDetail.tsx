import { type BoardDetailsResponse, type CommentResponse, createComment, getBoardDetails } from '@/backend';
import { CommunityTrendingList } from '@/custom/components/CommunityTrendingList';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaOutlinedInput } from '@/custom/components/MedipandaOutlinedInput';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { useSession } from '@/hooks/useSession';
import { FixedLinearLoader } from '@/lib/react/FixedLinearLoader';
import { colors } from '@/themes';
import { formatRelativeTime, formatYyyyMmDdHhMm } from '@/lib/dateFormat';
import { MoreHoriz } from '@mui/icons-material';
import { IconButton, Popover, Stack, type StackProps, Typography } from '@mui/material';
import { EditorContent } from '@tiptap/react';
import { type FormEvent, type MouseEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

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

  const [postPopupAnchor, setPostPopupAnchor] = useState<HTMLElement | null>(null);
  const [popupRelatedComment, setPopupRelatedComment] = useState<CommentResponse | null>(null);

  if (!detail) {
    return <FixedLinearLoader />;
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
              <Stack direction='row' alignItems='center' gap='5px'>
                <img src='/assets/icons/icon-favorite.svg' />
                <Typography variant='smallTextR' sx={{ color: colors.gray60 }}>
                  {detail.likesCount.toLocaleString()}
                </Typography>
              </Stack>
              <Stack direction='row' alignItems='center' gap='5px'>
                <img src='/assets/icons/icon-chat.svg' />
                <Typography variant='smallTextR' sx={{ color: colors.gray60 }}>
                  {detail.commentCount.toLocaleString()}
                </Typography>
              </Stack>
              <Stack direction='row' alignItems='center' gap='5px'>
                <img src='/assets/icons/icon-view-alt.svg' />
                <Typography variant='smallTextR' sx={{ color: colors.gray60 }}>
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
          <CommunityTrendingList />
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
          const replies = comments.filter(it => it.parentId === comment.id);

          return (
            <Stack key={comment.id} gap='10px'>
              <Comment comment={comment} replies={replies} onClick={onClick} />
              {replies.map(reply => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  replies={null}
                  onClick={onClick}
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
  ...props
}: {
  comment: CommentResponse;
  replies: CommentResponse[] | null;
  onClick?: (event: MouseEvent<HTMLElement>, comment: CommentResponse) => void;
} & Omit<StackProps, 'onClick'>): ReturnType<typeof Stack> {
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
      <Stack
        direction='row'
        alignItems='center'
        gap='30px'
        sx={{
          height: '28px',
        }}
      >
        <Typography variant='smallTextR' sx={{ color: colors.gray60 }}>
          {formatRelativeTime(comment.createdAt)}
        </Typography>
        <Stack direction='row' alignItems='center' gap='5px'>
          <img src='/assets/icons/icon-favorite.svg' />
          <Typography variant='smallTextR' sx={{ color: colors.gray60 }}>
            좋아요 {comment.likesCount.toLocaleString()}
          </Typography>
        </Stack>
        {replies !== null && (
          <Stack direction='row' alignItems='center' gap='5px'>
            <img src='/assets/icons/icon-chat.svg' />
            <Typography variant='smallTextR' sx={{ color: colors.gray60 }}>
              대댓글 {replies.length.toLocaleString()}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
