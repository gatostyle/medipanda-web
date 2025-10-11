export function isValidUserId(userId: string): true | string {
  if (userId.length < 4 || userId.length > 20) {
    return '아이디는 4자 이상 20자 미만이어야 합니다.';
  }

  if (!/^[a-zA-Z0-9]+$/.test(userId)) {
    return '아이디는 영문 대소문자와 숫자만 포함할 수 있습니다.';
  }

  return true;
}

export function isValidPassword(password: string): true | string {
  if (password.length < 8 || password.length > 64) {
    return '비밀번호는 8자 이상 64자 미만이어야 합니다.';
  }

  let count = 0;
  if (/[A-Z]/.test(password)) count++;
  if (/[a-z]/.test(password)) count++;
  if (/[0-9]/.test(password)) count++;
  if (/[^A-Za-z0-9]/.test(password)) count++;

  if (count < 3) {
    return '비밀번호는 영문 대문자, 영문 소문자, 숫자, 특수문자 중 3가지 이상을 포함해야 합니다.';
  }

  return true;
}
