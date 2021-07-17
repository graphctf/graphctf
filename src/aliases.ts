import moduleAlias from 'module-alias';
import path from 'path';

const rootPath = path.resolve(__dirname, '..');
moduleAlias.addAliases({
  '~': process.env.NODE_ENV === 'development'
    ? path.resolve(rootPath, 'src')
    : path.resolve(rootPath, 'dist'),
});
