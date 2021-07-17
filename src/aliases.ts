import moduleAlias from 'module-alias';
import path from 'path';

const rootPath = path.resolve(__dirname, '..');
moduleAlias.addAliases({
  '~': process.env.NODE_ENV === 'production'
    ? path.resolve(rootPath, 'dist')
    : path.resolve(rootPath, 'src'),
});
