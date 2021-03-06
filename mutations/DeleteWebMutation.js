// @flow
import { graphql, commitMutation } from 'react-relay';
import type { Commit } from '../types';
import type {
  DeleteWebMutationVariables,
  DeleteWebMutationResponse,
} from './__generated__/DeleteWebMutation.graphql';
import { ConnectionHandler } from 'relay-runtime';
import { createFilter } from '../pages/me';

const mutation = graphql`
  mutation DeleteWebMutation($input: DeleteWebInput!) {
    deleteWeb(input: $input) {
      # Request payload data needed for store update.
      deletedId
    }
  }
`;

// https://github.com/relayjs/relay-examples
const sharedUpdater = (store, deletedId, viewerId, userId) => {
  const viewerProxy = store.get(viewerId);
  const connection = ConnectionHandler.getConnection(
    viewerProxy,
    'WebList_allWebs',
    {
      ...createFilter(userId),
      orderBy: 'createdAt_ASC',
    },
  );
  // https://github.com/facebook/relay/issues/1808#issuecomment-304519883
  if (!connection) {
    // eslint-disable-next-line no-console
    console.warn('Undefined connection. Check getConnection arguments.');
  }
  ConnectionHandler.deleteNode(connection, deletedId);
};

type CommitWithArgs = (
  viewerId: string,
  userId: string,
) => Commit<DeleteWebMutationVariables, DeleteWebMutationResponse>;

const commit: CommitWithArgs = (viewerId, userId) => (
  environment,
  variables,
  onCompleted,
  onError,
) =>
  commitMutation(environment, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: store => {
      const payload = store.getRootField('deleteWeb');
      const deletedId = payload.getValue('deletedId');
      sharedUpdater(store, deletedId, viewerId, userId);
    },
  });

export default { commit };
