<script>
    import { DataHandler } from '@vincjo/datatables';
    import { Th, ThFilter } from '@vincjo/datatables';
  
    export let handler;
  </script>
  
  <thead>
    <!-- sortable table headers TODO figure out a way to automate this across other table implementations -->
    <tr>
      <Th {handler} orderBy="away_player">Away Player</Th>
      <Th {handler} orderBy="home_player">Home Player</Th>
      <Th {handler} orderBy="away_score">Away Score</Th>
      <Th {handler} orderBy="home_score">Home Score</Th>
      <Th {handler} orderBy="tag_set">Game Mode</Th>
      <Th {handler} orderBy="start_time">Start Date</Th>
    </tr>
    <!-- table filters-->
    <tr>
      <ThFilter {handler} filterBy="away_player" />
      <ThFilter {handler} filterBy="home_player" />
      <ThFilter {handler} filterBy="away_score" />
      <ThFilter {handler} filterBy="home_score" />
      <ThFilter {handler} filterBy="tag_set" />
      <ThFilter {handler} filterBy="start_time" />
    </tr>
  </thead>
  
  <style>
    .ThFilter {
      color: #f5f5f5;
    }
  </style>
  